const mariadb = require("mariadb");
const { dbConf } = require("../config");

const maria = mariadb.createConnection(dbConf);

module.exports.insert_user = (username, password, first_name, last_name, email) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("INSERT INTO users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)", [username, password, first_name, last_name, email]);
        })
        .catch((err) => {
            console.log("error in insert_user", err);
        });
};

module.exports.getIdFromUsername = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT id FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getIdFromUsername", err);
        });
};

module.exports.getHashFromUsername = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT password FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getHashFromUsername", err);
        });
};

module.exports.getUserData = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT id, first_name, last_name FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getUserData", err);
        });
};

module.exports.getUserDataFromEmail = (email) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT first_name FROM users WHERE email = (?)", [email]);
        })
        .catch((err) => {
            console.log("error in getUserDataFromEmail", err);
        });
};

