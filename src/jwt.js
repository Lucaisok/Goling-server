require("dotenv").config({ path: "./secret.env" });
const jwt = require("jsonwebtoken");

module.exports.createToken = (username) => {
    // Eg: 1000, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
    const maxAge = 60 * 30;    // 30 minutes
    return jwt.sign({ username }, `${process.env.JWT_SECRET}`, {
        expiresIn: maxAge,
    });
};

module.exports.createRefreshToken = (username) => {
    // Eg: 1000, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
    const maxAge = "30d";   // 30 days
    return jwt.sign({ username }, `${process.env.JWT_REFRESH_SECRET}`, {
        expiresIn: maxAge,
    });
};

module.exports.requireAuth = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization;

        jwt.verify(token, `${process.env.JWT_SECRET}`, (err) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    console.log("token expired");
                    res.json(false); //send smt else
                } else {
                    //we should directly log out here since the token is fake
                    console.log("fake token");
                    res.json(false);
                }
            } else {
                next();
            }
        });

    } else {
        console.log('No authorization headers.');
        res.json(false);
    }
};

module.exports.requireRefreshAuth = (req, res, next) => {
    if (req.headers.refreshauthorization) {
        const refreshToken = req.headers.refreshauthorization;

        jwt.verify(refreshToken, `${process.env.JWT_REFRESH_SECRET}`, (err) => {
            if (err) {
                res.json(false);
            } else {
                next();
            }
        });

    } else {
        console.log('No authorization headers.');
        res.json(false);
    }
};