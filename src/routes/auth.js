const { Router } = require("express");
const router = Router();
const db = require("../db");
const { hash, compare } = require("../bc");
const auth = require("../jwt");

router.post("/signin", async (req, res) => {
    if (req?.body?.username && req.body.password && req.body.first_name && req.body.last_name) {
        const username = req.body.username;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const password = await hash(req.body.password);

        try {
            const existing_id = await db.getIdFromUsername(username);

            if (existing_id.length) {
                res.json({ existing_username: existing_id });

            } else {
                await db.insert_user(username, password, first_name, last_name);
                const id = await db.getIdFromUsername(username);
                const token = auth.createToken(username);
                const refresh_token = auth.createRefreshToken(username);
                res.json({ token, refresh_token, id: id[0].id });
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

router.post("/login", async (req, res) => {
    if (req?.body?.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;

        try {
            const hashedPwd = await db.getHashFromUsername(username);

            if (!hashedPwd.length) {
                //username does not exist
                res.json({ wrong_username: true });

            } else {
                const passwordMatch = await compare(password, hashedPwd[0].password);

                if (!passwordMatch) {
                    //password is wrong
                    res.json({ wrong_password: true });

                } else {
                    //login
                    const userData = await db.getUserData(username);
                    const id = userData[0].id;
                    const first_name = userData[0].first_name;
                    const last_name = userData[0].last_name;
                    const token = auth.createToken(username);
                    const refresh_token = auth.createRefreshToken(username);
                    res.json({ id, first_name, last_name, token, refresh_token });
                }

            }

        } catch (err) {
            console.log("err in /login", err);
            res.json(false);
        }
    } else {
        console.log("body, malformed");
        res.json(false);
    }
});

module.exports = router;
