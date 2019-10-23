const mysql = require('mysql');
const createMySQLWrap = require('mysql-wrap');
const data = require("../dbzugang");
const connection =  mysql.createPool({
    host: 'localhost',
    user: data.username,
    password: data.passwort,
    database: data.datenbank,
    port: data.port
});

const sql = createMySQLWrap(connection);

module.exports =  sql;