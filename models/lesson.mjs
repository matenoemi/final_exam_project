import { conn } from "../db/mysqlconn.mjs";

export async function getByTest(testID){
    const [lesson] = await conn.execute(
        "select lesson_id from tests where test_id = ?", [testID]
    );
    return lesson[0].lesson_id;
}

export async function addNew(chapterID, lessonName){
    const [pos] = await conn.execute(
        "select max(lesson_position) as pos from lessons where chapter_id = ?", [chapterID]
    )
    const position = pos[0].pos+1;
    const [result] = await conn.execute(
        "insert into lessons(lesson_name, lesson_position, chapter_id) values(?, ?, ?)",
        [lessonName, position, chapterID]
    );
    return result;
}

export async function getNameByID(lessonID){
    const [result] = await conn.execute(
        "select lesson_name from lessons where lesson_id = ?", [lessonID]
    );
    return result[0].lesson_name;
}