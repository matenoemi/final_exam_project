import { conn } from "../db/mysqlconn.mjs";


export async function getListByLesson(lessonID){
    const [tests] = await conn.execute(
        "select test_id, test_name from tests where lesson_id = ?", [lessonID]
    );
    return tests;
}

export async function addExercise(testID, exerciseID){
    const [result] = await conn.execute(
        "insert into tests_and_exercises (test_id, exercise_id) values (?, ?)", [testID, exerciseID]
    );
    return result;
}