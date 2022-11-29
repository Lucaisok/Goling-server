const https = require("https");

module.exports.translate = async (message, sourceLanguage, targetLanguage) => {

    const data = JSON.stringify({
        q: message,
        source: sourceLanguage,
        target: targetLanguage
    });

    const options = {
        hostname: 'libretranslate.de',
        // port: 3001,
        path: '/translate',
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {

            res.on('data', (d) => {
                const response = JSON.parse(d);
                resolve(response);
            });

        });

        req.on('error', (e) => {
            console.log("err", e.stack, e);
            reject(e);
        });

        req.write(data);

        req.end();
    });
};