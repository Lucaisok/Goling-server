require("dotenv").config({ path: "../secret.env" });
const { Router } = require("express");
const router = Router();
const db = require("../db");
const auth = require("../jwt");

router.get("/get-users", auth.requireAuth, async (req, res) => {
    try {
        const users = await db.getUsers();
        res.json(users);

    } catch (err) {
        console.log("err", err);

    }
});

module.exports = router;
