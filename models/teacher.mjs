import {conn} from "../db/mysqlconn.mjs";
import * as userModel from "../models/user.mjs";

export async function getList(){
    const [teachers] = await conn.execute(
        "select user_id, user_name from users where user_role = 'teacher' "
    );
    return teachers;
}

export async function addNew(name, password){
    const hash = userModel.hashPassword(password);
    const maxID = await userModel.getMaxID();
    const names = name.split(" ");
    const email = names[0].toLowerCase()+"_"+names[1].toLowerCase()+maxID;
    console.log(email+" "+hash+" "+name);
    const [result] = await conn.execute(
        "insert into users(user_email, user_password, user_name, user_role) "+
        "values (?, ?, ?, 'teacher') ", [email, hash, name]
    );
    return result;
}