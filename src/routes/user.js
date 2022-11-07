require("dotenv").config({ path: "../secret.env" });
const { Router } = require("express");
const router = Router();
const db = require("../db");
const auth = require("../jwt");

router.post("/update-language", auth.requireAuth, async (req, res) => {
    if (req?.body?.username && req.body.language) {
        const username = req.body.username;
        const language = req.body.language;

        try {
            await db.updateLanguage(language, username);
            res.json({ success: true });

        } catch (err) {
            console.log("err", err);
            res.json({ success: false });
        }
    }
});

module.exports = router;
