import { conn } from "../db/mysqlconn.mjs";


export async function getListByClass(classID){
    const [students] = await conn.execute(
        "select user_id, user_name from users where class_id = ?;", [classID]
    );
    return students;
}

export async function getByID(studentID){
    const [student] = await conn.execute(
        "select user_name from users where user_id = ?;", [studentID]
    );
    return student[0];
}