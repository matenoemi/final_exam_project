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

export async function addToLesson(testName, lessonID){
    const [result] = await conn.execute(
        "insert into tests (test_name, lesson_id) values (?, ?)", [testName, lessonID]
    );
    return result;
}

export async function getName(testID){
    const [test] = await conn.execute(
        "select test_name from tests where test_id = ?", [testID]
    );
    return test[0].test_name;
}