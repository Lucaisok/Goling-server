const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const PORT = 3003;
const db = require("./src/db");
const { hash, compare } = require("./src/bc");
const auth = require("./src/jwt");

const httpsServer = https.createServer(
    {
        key: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/softwarenoise.com/fullchain.pem"),
    },
    app
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post("/signin", async (req, res) => {
    if (req?.body?.username && req.body.password && req.body.first_name && req.body.last_name) {
        const username = req.body.username;
        const first_name = req.body.firstName;
        const last_name = req.body.lastName;
        const password = await hash(req.body.password);

        try {
            const existing_username = await db.check_username(username);

            if (existing_username) {
                res.json({ existing_username });

            } else {
                await db.insert_user(username, password, first_name, last_name);
                const token = auth.createToken(username);
                const refresh_token = auth.createRefreshToken(username);
                res.json(token, refresh_token);
            }

        } catch (err) {
            console.log("err in /signup", err);
            res.json(false);
        }

    } else {
        console.log("body malformed");
        res.json(false);
    }
});

httpsServer.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));