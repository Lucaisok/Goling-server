const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const db = require("./src/db");
const { hash, compare } = require("./src/bc");

const httpsServer = https.createServer(
    {
        key: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/fullchain.pem"),
    },
    app
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post("/test", async (req, res) => {
    console.log("request received", req.body);
    if (req?.body?.username && req.body.password) {
        const username = req.body.username;
        const password = await hash(req.body.password);

        try {
            await db.insert_user(username, password);
            res.json("success!");

        } catch (err) {
            console.log("err in /signup", err);
            res.json("fail!");
        }

    }
});

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));