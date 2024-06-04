import { conn } from "../db/mysqlconn.mjs";

export async function addNew(courseID, chapterName){
    const [result] = await conn.execute(
        "insert into chapters(chapter_name, course_id) values(?,?)",
        [chapterName, courseID]
    );
    return result;
}

export async function getNameByID(chapterID){
    const [result] = await conn.execute(
        "select chapter_name from chapters where chapter_id = ?", [chapterID]
    );
    return result[0].chapter_name;
}