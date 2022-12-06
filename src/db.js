const mariadb = require("mariadb");
const { dbConf } = require("../config");

const maria = mariadb.createConnection(dbConf);

module.exports.insert_user = (username, password, first_name, last_name, email, language) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("INSERT INTO users (username, password, first_name, last_name, email, language) VALUES (?, ?, ?, ?, ?, ?)", [username, password, first_name, last_name, email, language]);
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
                return connection.query("SELECT id, first_name, last_name, language FROM users WHERE username = (?)", [username]);
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

module.exports.updateFiveDigitCode = (code, email) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE users SET reset_pwd_code = (?) WHERE email = (?)", [code, email]);
        })
        .catch((err) => {
            console.log("error in updateFiveDigitCode", err);
        });
};

module.exports.getUserDataFromId = (id) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT first_name, last_name, username, language FROM users WHERE id = (?)", [id]);
        })
        .catch((err) => {
            console.log("error in getUserDataFromId", err);
        });
};

module.exports.retrieveFiveDigitCode = (email) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT reset_pwd_code FROM users WHERE email = (?)", [email]);
        })
        .catch((err) => {
            console.log("error in retrieveFiveDigitCode", err);
        });
};

module.exports.updatePassword = (password, email) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE users SET password = (?) WHERE email = (?)", [password, email]);
        })
        .catch((err) => {
            console.log("error in updatePassword", err);
        });
};

module.exports.getUsers = () => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT username FROM users", []);
        })
        .catch((err) => {
            console.log("error in getUsers", err);
        });
};

module.exports.updateLanguage = (language, username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE users SET language = (?) WHERE username = (?)", [language, username]);
        })
        .catch((err) => {
            console.log("error in updateLanguage", err);
        });
};

module.exports.getSocket = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT socket_id FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getSocket", err);
        });
};

module.exports.updateSocketId = (socket, username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE users SET socket_id = (?) WHERE username = (?)", [socket, username]);
        })
        .catch((err) => {
            console.log("error in updateSocketId", err);
        });
};

module.exports.getId = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT id FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getId", err);
        });
};

module.exports.getReceiverData = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT language, id, chat_partner FROM users WHERE username = (?)", [username]);
        })
        .catch((err) => {
            console.log("error in getLanguage", err);
        });
};

module.exports.insert_message = (sender, receiver, original_body, translated_body, users, original_language, translation_language, unread) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("INSERT INTO messages (sender, receiver, original_body, translated_body, users, original_language, translation_language, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [sender, receiver, original_body, translated_body, users, original_language, translation_language, unread]);
        })
        .catch((err) => {
            console.log("error in insert_messages", err);
        });
};

module.exports.getChat = (users) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT * FROM messages WHERE users = (?) ORDER BY id", [users]);
        })
        .catch((err) => {
            console.log("error in getChat", err);
        });
};

module.exports.getUnreadMessages = (username) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT * FROM messages WHERE receiver = (?) AND unread = 1 ORDER BY id", [username]);
        })
        .catch((err) => {
            console.log("error in getUnreadMessages", err);
        });
};

module.exports.updateChatPartner = (username, id) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE users SET chat_partner = (?) WHERE id = (?)", [username, id]);
        })
        .catch((err) => {
            console.log("error in updateChatPartner", err);
        });
};

module.exports.updateUnreadMessages = (users) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("UPDATE messages SET unread = 0 WHERE users = (?)", [users]);
        })
        .catch((err) => {
            console.log("error in updateUnreadMessages", err);
        });
};

module.exports.getMessageId = (users) => {
    return maria
        .then((connection) => {
            if (connection.isValid())
                return connection.query("SELECT id FROM messages WHERE users = (?) ORDER BY id DESC LIMIT 1", [users]);
        })
        .catch((err) => {
            console.log("error in getMessageId", err);
        });
};

