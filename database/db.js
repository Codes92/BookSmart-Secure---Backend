const {Pool} = require("pg");

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "booksmart_secure",
    port: 5432
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connection successfully:', res.rows[0].now);
    }
});

module.exports = pool;