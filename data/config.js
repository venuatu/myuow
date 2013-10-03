"use strict";
function getCerts() {
    var fs = require('fs'),
        certs = [];
    fs.readdirSync('sols_certs').forEach(function (v) {
        console.log('Loading sols cert:', v);
        certs.push(fs.readFileSync('./sols_certs/' + v));
    });
    return certs;
}

module.exports =  {
    port: 1111,
    address: 'localhost',
    // you could make a new key with: node -e "console.log(JSON.stringify(require('crypto').randomBytes(256/8).toString('base64')))"
    key: "change me?",
    sql: {
        dialect: 'sqlite',
        storage: '/tmp/uow.sqlite',
        logging: false,
    },
    solsCerts: getCerts()
};
