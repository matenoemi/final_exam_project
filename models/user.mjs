import { conn } from "../db/mysqlconn.mjs";
import { createHash } from "crypto";

export async function getMaxID(){
    const [user] = await conn.execute("select max(user_id) as id from users");
    return user[0].id+1;
}

export function hashPassword(password){
    const hash = createHash("sha1").update(password).digest("hex");
    return hash;
}