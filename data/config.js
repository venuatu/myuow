"use strict";

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
};
