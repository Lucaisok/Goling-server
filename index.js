const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const auth = require("./src/routes/auth");
const search = require("./src/routes/search");
const user = require("./src/routes/user");
const cors = require('cors');
const { Server } = require('socket.io');

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

io.on('connection', (socket) => {
    //retrieve username and append it to the socket
    const { username } = socket.handshake.query;
    socket.username = username;
    console.log(`User connected, socketId: ${socket.id}, username: ${username}`);

    //retrieve a list of all connected users and send to all the connected clients
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            socketId: id,
            username: socket.username,
        });
    }
    console.log("users", users);
    io.emit("users", users);

    //check if socket duplicates, if so reload that client
    const activeSocketInstances = [];
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) activeSocketInstances.push(users[i].username);
    }
    if (activeSocketInstances.length > 1) {
        socket.emit("socket-duplicate");
    }

    //socket events
    socket.on("join-room", (data) => {
        if (data.username && data.room && data.chatPartner) {
            const { username, room, chatPartner } = data;
            console.log("username", username, "room", room, "chatPartner", chatPartner);
        }
    });

    socket.on("message", ({ content, to }) => {
        console.log("content", content);
        console.log("to", to);
        socket.to(to).emit("message", {
            content,
            from: socket.username,
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`user disconnected, socketId: ${socket.id}, username: ${username}, reason: ${reason}`);
    });
});

app.use(auth);
app.use(user);
app.use(search);

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));