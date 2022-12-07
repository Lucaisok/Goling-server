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
            //update chat_partner 
            await db.updateChatPartner(chatPartnerUsername, userId);
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

router.get("/unread-messages", auth.requireAuth, async (req, res) => {
    if (req?.query?.username) {

        const username = req.query.username;

        try {
            //retrieve unread messages
            const unreadMessages = await db.getUnreadMessages(username);

            res.json(unreadMessages);

        } catch (err) {
            console.log("err", err);
        }
    }
});

router.post("/update-message-unread-flag", auth.requireAuth, async (req, res) => {
    if (req?.body?.userId && req.body.chatPartnerUsername) {

        const userId = req.body.userId;
        const chatPartnerUsername = req.body.chatPartnerUsername;

        try {
            const chatPartnerId = await db.getId(chatPartnerUsername);
            const usersArray = [parseInt(userId), chatPartnerId[0].id].sort(function (a, b) { return a - b; });

            await db.updateUnreadMessages(JSON.stringify(usersArray));

        } catch (err) {
            console.log("err", err);
        }

    }
});

module.exports = router;
