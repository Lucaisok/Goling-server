const mariadb = require("mariadb");
const { dbConf } = require("../config");

const maria = mariadb.createConnection(dbConf);

module.exports.insert_user = (username, password, first_name, last_name) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("INSERT INTO users (username, password, first_name, last_name) VALUES (?, ?, ?, ?)", [username, password, first_name, last_name]);
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
            console.log("error in insert_user", err);
        });
};

