const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const auth = require("./src/routes/auth");
const search = require("./src/routes/search");
const user = require("./src/routes/user");
const chat = require("./src/routes/chat");
const db = require("./src/db");
const cors = require('cors');
const { Server } = require('socket.io');
const { translate } = require("./src/externalCalls");

const httpsServer = https.createServer(
    {
        key: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/fullchain.pem"),
    },
    app
);

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(httpsServer, {
    cors: {
        origin: 'https://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

let onlineUsers = [];

io.on('connection', async (socket) => {
    //retrieve username and append it to the socket
    const { username, id } = socket.handshake.query;
    socket.username = username;
    socket.userId = id;
    console.log(`User connected, socketId: ${socket.id}, username: ${socket.username}, userId: ${socket.userId}`);

    let connectedUsers = [];
    //retrieve a list of all connected users and send to all the connected clients
    for (let [id, socket] of io.of("/").sockets) {
        connectedUsers.push({
            socketId: id,
            username: socket.username,
            userId: socket.userId
        });
    }

    onlineUsers = connectedUsers;
    io.emit("users", connectedUsers);

    console.log("connectedUsers", connectedUsers);

    //check if socket duplicates, if so reload that client
    let activeSocketInstances = [];
    for (let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].username === username) activeSocketInstances.push(connectedUsers[i].username);
    }
    if (activeSocketInstances.length > 1) {
        socket.emit("socket-duplicate");
    }

    //on reconnection, update socket_id in db
    try {
        await db.updateSocketId(socket.id, username);

    } catch (err) {
        console.log("err", err);

    }

    socket.on("message", async ({ content, language, to }) => {
        if (content && language && to) {
            const receiverData = await db.getLanguageAndId(to);
            //this is basically the "name" of the conversation, and is made of a sorted array containing the users id´s
            const usersArray = [parseInt(socket.userId), receiverData[0].id].sort(function (a, b) { return a - b; });
            const onlineReceiver = onlineUsers.find(user => user.username === to);

            try {
                if (language === receiverData[0].language) {

                    await db.insert_message(username, to, content, content, JSON.stringify(usersArray), language, language, !Boolean(onlineReceiver));

                    if (onlineReceiver) {
                        socket.to(onlineReceiver.socketId).emit("message", {
                            content,
                            from: socket.username,
                        });
                    }

                } else {
                    //translate message and send to receiver!
                    const result = await translate(content, language, receiverData[0].language);

                    await db.insert_message(username, to, content, result.translatedText, JSON.stringify(usersArray), language, receiverData[0].language, !Boolean(onlineReceiver));

                    if (onlineReceiver) {
                        socket.to(onlineReceiver.socketId).emit("message", {
                            content: result.translatedText,
                            from: socket.username,
                        });
                    }

                }

            } catch (err) {
                console.log("err", err);

            }
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`user disconnected, socketId: ${socket.id}, username: ${username}, reason: ${reason}`);
    });
});

app.use(auth);
app.use(user);
app.use(chat);
app.use(search);

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));