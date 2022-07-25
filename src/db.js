const mariadb = require("mariadb");
const { dbConf } = require("../config");

const maria = mariadb.createConnection(dbConf);

module.exports.insert_user = (username, password) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("INSERT INTO users (username, password) VALUES (?, ?) ", [username, password]);
        })
        .catch((err) => {
            console.log("error in insert_user", err);
        });
};