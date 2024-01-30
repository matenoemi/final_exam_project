import { conn } from "../db/mysqlconn.mjs";

export async function saveResult(user, exerciseID, correctAnswers){
    const [res] = await conn.execute(
        "insert into results(user_id, exercise_id, result_value) values(?, ?, ?)",
        [user.user_id, exerciseID, correctAnswers]
    );
    return res;
}

export async function getNumberOfCorrectAnswers(exerciseID){
    const [result] = await conn.execute(
        "select count(*) as value from exercises e join answers a on a.exercise_id=e.exercise_id where "+
        "a.answer_flag=1 and e.exercise_id = ? ", [exerciseID]
    );
    return result[0].value;
}

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

export async function getSlidesByLesson(id,req,res,next){
    const [slides] = await conn.execute(
        "select s.slide_id, s.slide_text, i.image_object, i.image_text from slides s join images i on s.image_id = i.image_id where lesson_id = ? order by slide_position", [id]
    );
    return slides;
}

export async function getExerciseID(lessonID, exercisePos){
    const [exerciseTemp] = await conn.execute(
        "select exercise_id, exercise_text, exercise_position, image_id from exercises "+
        "where lesson_id = ? and exercise_position = ?", [lessonID, exercisePos]   
    );
    let exercise = exerciseTemp[0];
    return exercise.exercise_id;
}

export async function getExercise(lessonID, exercisePos){
    const [exerciseTemp] = await conn.execute(
        "select exercise_id, exercise_text, exercise_position, image_id from exercises "+
        "where lesson_id = ? and exercise_position = ?", [lessonID, exercisePos]   
    );
    let exercise = exerciseTemp[0];
    console.log(exercise);
    if(exercise.image_id !== null){
        const [image] = await conn.execute(
        "select i.image_object, i.image_text "+
        "from exercises e join images i on e.image_id = i.image_id "+
        "where e.lesson_id = ? and e.exercise_position = ?", [lessonID, exercisePos]  
        );
        console.log(image);
        exercise.image_object = image[0].image_object;
        exercise.image_text = image[0].image_text;
    }

    console.log(exercise);
    return exercise;
}

export async function getAnswers(exerciseID){
    const [answers] = await conn.execute(
        "select a.answer_id, a.answer_text, i.image_object, i.image_text, a.answer_flag "+
        "from answers a join images i on a.image_id = i.image_id "+
        "where a.exercise_id = ?", [exerciseID]
    );
    return answers;
}