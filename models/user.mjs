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

export async function updatePassword(userID, oldP, newP){
    const hashOld = hashPassword(oldP);
    const [user] = await conn.execute(
        "select * from users where user_id = ? and user_password = ?", [userID, hashOld]
    );
    if(user.length==0){
        return 0;
    }
    else{
        const hashNew = hashPassword(newP);
        const [user] = await conn.execute(
            "update users set user_password = ? where user_id = ?", [hashNew, userID] 
        );
        return 1;
    }
}