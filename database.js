"use strict";
var sequelize = require('sequelize'),
    config = require('./config'),
    db = new sequelize('database', 'username', 'password', config.sql);

module.exports = {
    db: db,

    Session: db.define('session', {
        number: sequelize.INTEGER,
        sid: sequelize.STRING,
        cs: sequelize.STRING,
        csmenu: sequelize.STRING
    }),
    Subject: db.define('subject', {
        code: sequelize.STRING,
        val: sequelize.STRING
    })
}

console.log("Creating database");
db.sync({
//    force: true// drops and recreates tables
});
