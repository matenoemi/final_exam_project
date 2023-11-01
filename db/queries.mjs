import { conn } from "../db/mysqlconn.mjs";

export async function getChapters(req,res,next){
    const [chapters] = await conn.execute(
        "select chapter_id,chapter_name from chapters"
      );
      return chapters;
}

export async function getLessonsByChapter(id,req,res,next){
    const [lessons] = await conn.execute(
        "select lesson_id, lesson_name from lessons where chapter_id = ? order by lesson_position", [id]
    );
    return lessons;
}