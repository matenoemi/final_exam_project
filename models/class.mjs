import { conn } from "../db/mysqlconn.mjs";

export async function getList(teacherID){
    const [classes] = await conn.execute(
        "select class_id, class_name, class_grade from classes where teacher_id = ?;", [teacherID]
    );
    return classes;
}