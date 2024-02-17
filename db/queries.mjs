import { conn } from "../db/mysqlconn.mjs";


export async function resultsOverview(){
    const [res] = await conn.execute(
        "select u.user_name, l.lesson_name, e.exercise_id, e.exercise_text, r.result_value, r.result_date from results r join users u on r.user_id = u.user_id join exercises e on "+
        "e.exercise_id = r.exercise_id join lessons l on e.lesson_id = l.lesson_id"
    );
    return res;
}

export async function saveResult(user, exerciseID, correctAnswers){
    const [res] = await conn.execute(
        "insert into results(user_id, exercise_id, result_value) values(?, ?, ?)",
        [user.user_id, exerciseID, correctAnswers]
    );
    return res;
}

export async function getChapters(){
    const [chapters] = await conn.execute(
        "select chapter_id,chapter_name from chapters"
    );
    return chapters;
}

export async function getLessonsByChapter(id){
    const [lessons] = await conn.execute(
        "select lesson_id, lesson_name from lessons where chapter_id = ? order by lesson_position", [id]
    );
    return lessons;
}

export async function getSlidesByLesson(id){
    const [slides] = await conn.execute(
        "select s.slide_id, s.slide_text, i.image_object, i.image_text from slides s join images i on s.image_id = i.image_id where lesson_id = ? order by slide_position", [id]
    );
    return slides;
}
