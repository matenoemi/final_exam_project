import { conn } from "../db/mysqlconn.mjs";


export async function resultsOverview(){
    const [res] = await conn.execute(
        "select u.user_name, l.lesson_name, e.exercise_id, e.exercise_text, r.result_value, r.result_date from results r join users u on r.user_id = u.user_id join exercises e on "+
        "e.exercise_id = r.exercise_id join lessons l on e.lesson_id = l.lesson_id order by r.result_date"
    );
    return res;
}


export async function getChapters(courseID){
    const [chapters] = await conn.execute(
        "select chapter_id,chapter_name from chapters where course_id = ? ", [courseID]
    );
    return chapters;
}

export async function getLessonsByChapter(id){
    const [lessons] = await conn.execute(
        "select lesson_id, lesson_flag, lesson_position, lesson_name from lessons where chapter_id = ? order by lesson_position", [id]
    );
    return lessons;
}

export async function getSlidesByLesson(id){
    const [slide] = await conn.execute(
        "select * from slides where lesson_id = ? order by slide_position",[id]
    );
    let slides = [];
    for(let i=0; i<slide.length; i++){
        const slideID = slide[i].slide_id;
        if(slide[i].image_id == null){
            slides[slides.length] = await getWithVideo(slideID);
        }
        else{
            slides[slides.length] = await getWithImage(slideID);
        }
    }
    return slides;
}

async function getWithImage(slideID){
    const [slides] = await conn.execute(
        "select s.slide_id, s.slide_text, i.image_id, i.image_object, i.image_text from slides s join images i on s.image_id = i.image_id where s.slide_id = ?", [slideID]
    );
    return slides[0];
}

async function getWithVideo(slideID){
    const [slides] = await conn.execute(
        "select * from slides where slide_id = ?", [slideID]
    );
    return slides[0];
}
