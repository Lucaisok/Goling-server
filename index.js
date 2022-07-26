const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const auth = require("./src/routes/auth");

const httpsServer = https.createServer(
    {
        key: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/fullchain.pem"),
    },
    app
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(auth);

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));