const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const auth = require("./src/routes/auth");
const search = require("./src/routes/search");
const cors = require('cors');
const { Server } = require('socket.io'); // Add this

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

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

io.on('connection', (socket) => {
    const { username } = socket.handshake.query;
    socket.username = username;
    console.log(`User connected, socketId: ${socket.id}, username: ${username}`);

    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            socketId: id,
            username: socket.username,
        });
    }
    console.log("users", users);
    io.emit("users", users);

    socket.on("join-room", (data) => {
        if (data.username && data.room && data.chatPartner) {
            const { username, room, chatPartner } = data;
            console.log("username", username, "room", room, "chatPartner", chatPartner);
        }
    });

    socket.on("message", ({ content, to }) => {
        console.log("content", content);
        console.log("to", to);
        socket.to(to).emit("private message", {
            content,
            from: socket.id,
        });
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected, socketId: ${socket.id}, username: ${username}`);
    });
});

app.use(auth);
app.use(search);

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));