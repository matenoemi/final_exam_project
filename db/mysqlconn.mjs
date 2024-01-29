import mysql from "mysql2/promise";

const getConn = async () => {
  try {
    const conn = await mysql.createConnection({
      /*
      host: "localhost",
      user: "learn_informatics_web",
      database: "learn_informatics_web",
      password: "The9oBruM#",
      */
      host: "localhost",
      user: "learn_info",
      database: "learn_info",
      password: "strangerthings",
    });
    conn.config.namedPlaceholders = true;
    return conn;
  } catch (err) {
    console.log(err.message);
  }
}

export const conn = await getConn();