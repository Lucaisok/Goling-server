require("dotenv").config({ path: "../secret.env" });
const { Router } = require("express");
const router = Router();
const db = require("../db");
const { hash, compare } = require("../bc");
const auth = require("../jwt");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lucatomarelli1@gmail.com',
        pass: process.env.TRANSPORTER_PWD
    }
});

router.post("/signin", async (req, res) => {
    if (req?.body?.username && req.body.password && req.body.first_name && req.body.last_name && req.body.email && req.body.language) {
        const username = req.body.username;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const language = req.body.language;
        const password = await hash(req.body.password);

        try {
            const existing_id = await db.getIdFromUsername(username);

            if (existing_id.length) {
                res.json({ existing_username: existing_id });

            } else {
                await db.insert_user(username, password, first_name, last_name, email, language);
                const id = await db.getIdFromUsername(username);
                const token = auth.createToken(username);
                const refresh_token = auth.createRefreshToken(username);

                const mailOptions = {
                    from: 'lucatomarelli1@gmail.com',
                    to: email,
                    subject: 'Welcome to Goling!',
                    html: `
                      <h1>Hi ${first_name}</h1>
                      <h2>Welcome to Goling</h2>
                      <p>This is your username: ${username}</p>
                    `
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("error in signup, send confirmation email", error);
                    } else {
                        console.log(`confirmation email sent to ${mailOptions.to}: ${info.response}`);
                    }
                });

                res.json({ token, refresh_token, id: id[0].id });
            }

        } catch (err) {
            console.log("err in /signup", err);
            res.json(false);
        }

    } else {
        console.log("body malformed in /signup");
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
                    const language = userData[0].language;
                    const token = auth.createToken(username);
                    const refresh_token = auth.createRefreshToken(username);
                    res.json({ id, first_name, last_name, token, refresh_token, language });
                }

            }

        } catch (err) {
            console.log("err in /login", err);
            res.json(false);
        }
    } else {
        console.log("body malformed in /login");
        res.json(false);
    }
});

router.post("/create-new-tokens", auth.requireRefreshAuth, async (req, res) => {
    if (req?.body?.username) {

        const username = req.body.username;
        const token = auth.createToken(username);
        const refreshToken = auth.createRefreshToken(username);

        res.json({ token, refreshToken });

    } else {
        console.log("body malformed in /create-new-tokens");
        res.json(false);
    }
});

router.post("/reset-password-email", async (req, res) => {
    if (req?.body?.email) {
        const email = req.body.email;

        try {
            const registeredUser = await db.getUserDataFromEmail(email);
            if (registeredUser.length) {
                const firstName = registeredUser[0].first_name;

                //generate random code, save it to the db (column with timestamp for exp date?) and send it along the email.

                const fiveDigitCode = Math.floor(Math.random() * 90000) + 10000;

                await db.updateFiveDigitCode(fiveDigitCode, email);

                setTimeout(function () { db.updateFiveDigitCode(1, email); }, 5 * 60 * 1000);

                const mailOptions = {
                    from: 'lucatomarelli1@gmail.com',
                    to: email,
                    subject: 'Reset your Goling Password',
                    html: `
                      <h1>Hi ${firstName}</h1>
                      <p>Insert the following code to reset your password:</p>
                      <p><strong>${fiveDigitCode}</strong></p>
                    `
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("error in reset-password-email, send email", error);
                        res.json({ serverError: true });

                    } else {
                        console.log(`reset-password-email email sent to ${mailOptions.to}: ${info.response}`);
                        res.json({ success: true });
                    }
                });

            } else {
                res.json({ success: false });
            }

        } catch (err) {
            res.json({ serverError: false });

        }

    } else {
        console.log("body malformed in /reset-password-email");
        res.json({ serverError: true });

    }
});

router.post("/verify-code", async (req, res) => {
    console.log("req?.body?", req?.body);
    if (req?.body?.code && req?.body?.email) {

        const code = JSON.parse(req.body.code);
        const email = req.body.email;

        try {
            const dbCode = await db.retrieveFiveDigitCode(email);

            if (dbCode[0].reset_pwd_code == code) {
                res.json({ success: true });

            } else {
                res.json({ success: false });
            }

        } catch (err) {
            console.log("err", err);
        }

    }
});

router.post("/update-password", async (req, res) => {

    if (req?.body?.password && req?.body?.email) {
        const email = req.body.email;

        try {
            const password = await hash(req.body.password);
            await db.updatePassword(password, email);

            res.json({ success: true });

        } catch (err) {
            console.log("err", err);
            res.json({ success: false });

        }
    }

});

router.post("/getUserData", auth.requireAuth, async (req, res) => {
    if (req?.body?.parsedUserId) {
        const userId = req.body.parsedUserId;

        try {
            const userData = await db.getUserDataFromId(userId);

            if (userData.length) {
                res.json(userData[0]);
            }

        } catch (err) {
            console.log("err", err);
        }
    }
});

module.exports = router;
