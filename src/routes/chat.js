require("dotenv").config({ path: "../secret.env" });
const { Router } = require("express");
const router = Router();
const db = require("../db");
const auth = require("../jwt");

router.get("/chat", auth.requireAuth, async (req, res) => {
    if (req?.query?.userId && req.query.chatPartnerUsername) {

        const userId = req.query.userId;
        const chatPartnerUsername = req.query.chatPartnerUsername;

        try {
            //retrieve chatPartnerId
            const chatPartnerId = await db.getId(chatPartnerUsername);
            const usersArray = [parseInt(userId), chatPartnerId[0].id].sort(function (a, b) { return a - b; });
            //retrieve chat
            const chat = await db.getChat(JSON.stringify(usersArray));
            res.json(chat);

        } catch (err) {
            console.log("err", err);
        }
    }
});

module.exports = router;
