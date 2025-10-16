const { Pool } = require("pg");

//database confug()
const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: 10,
  min: 0,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false,
  },
});

//connecting database
pool
  .query("SELECT NOW()")
  .then((res) => console.log("Server started at: ", res.rows[0].now))
  .catch((err) => {
    console.error(err.stack);
  });

module.exports = pool;
