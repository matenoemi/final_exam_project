import { conn } from "../db/mysqlconn.mjs";
import * as userModel from "../models/user.mjs";


export async function getListByClass(classID){
    const [students] = await conn.execute(
        "select user_id, user_name from users where class_id = ? order by user_name;", [classID]
    );
    return students;
}

export async function getByID(studentID){
    const [student] = await conn.execute(
        "select user_name, user_email from users where user_id = ?;", [studentID]
    );
    return student[0];
}

export async function addNew(name, password, classID){
    const hash = userModel.hashPassword(password);
    const maxID = await userModel.getMaxID();
    const names = name.split(" ");
    const email = names[0].toLowerCase()+"_"+names[1].toLowerCase()+maxID;

    const [result] = await conn.execute(
        "insert into users(user_email, user_password, user_name, user_role, class_id) "+
        "values (?, ?, ?, 'student', ?) ", [email, hash, name, classID]
    );
    return result;
}