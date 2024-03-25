import { conn } from "../db/mysqlconn.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as resultModel from "../models/result.mjs";

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

export async function isEditable(testID){
    const [test] = await conn.execute(
        "select test_editable from tests where test_id = ?", [testID]
    );
    return test[0].test_editable;
}

export async function setReadOnly(testID){
    const [result] = await conn.execute(
        "update tests set test_editable = 0 where test_id = ?", [testID]
    );
    return result;
}

export async function getScheduledList(testID){
    const [result] = await conn.execute(
        "select c.class_name, st.scheduled_tests_id, st.start_time, st.end_time from scheduled_tests st join classes c "+
        "on st.class_id = c.class_id where st.test_id = ? order by st.start_time desc", [testID]
    );
    return result;
}

export async function addNewSchedule(testID, classID, startTime, endTime){
    const [result] = await conn.execute(
        "insert into scheduled_tests(test_id, class_id, start_time, end_time) values(?,?,?,?)",
        [testID, classID, startTime, endTime]
    );
    return result;
}

export async function getByLessonID(lessonID, classID){
    const [test] = await conn.execute(
        "select st.scheduled_tests_id, t.test_name from "+
        "lessons l join tests t on l.lesson_id = t.lesson_id join "+
        "scheduled_tests st on t.test_id = st.test_id where l.lesson_id = ? "+
        "and st.class_id = ?", [lessonID, classID]
    );
    return test[0];
}

export async function getScheduled(scheduledTestID){
    const [test] = await conn.execute(
        "select st.scheduled_tests_id, c.class_name, t.test_name, t.test_id, st.end_time from "+
        "lessons l join tests t on l.lesson_id = t.lesson_id join "+
        "scheduled_tests st on t.test_id = st.test_id "+
        "join classes c on st.class_id = c.class_id "+
        "where st.scheduled_tests_id = ?", [scheduledTestID]
    );
    return test[0];
}

export async function getFirstExerciseID(testID){
    const [exercise] = await conn.execute(
        "select min(exercise_id) as exercise_id from tests_and_exercises where test_id = ?", [testID]
    );
    return exercise[0].exercise_id;
}

export async function getLastExerciseID(testID){
    const [exercise] = await conn.execute(
        "select max(exercise_id) as exercise_id from tests_and_exercises where test_id = ?", [testID]
    );
    return exercise[0].exercise_id;
}

async function getNextID(testID, exerciseID){
    const [exercise] = await conn.execute(
        "select min(exercise_id) as exercise_id from tests_and_exercises where test_id = ? "+
        "and exercise_id > ?", [testID, exerciseID]
    );
    if(exercise.length>0){
        return exercise[0].exercise_id;
    }
    else{
        return false;
    }
    
}

export async function getNextExercise(scheduledTestID, exerciseID){
    const scheduled = await getScheduled(scheduledTestID);
    const testID = scheduled.test_id;
    const nextID = await getNextID(testID, exerciseID);
    if(!nextID){
        return false;
    }
    else{
        const exercise = await exerciseModel.getExerciseByID(nextID);
        return exercise;
    }
}

export async function isActive(scheduledTestID){
    const [result] = await conn.execute(
        "select * from scheduled_tests where start_time<= curdate() "+
        "and curdate()<end_time and scheduled_tests_id = ?", [scheduledTestID]
    );
    if(result.length>0){
        return true;
    }
    else{
        return false;
    }
}

export async function isSolvable(scheduledTestID, userID){
    const scheduled = await getScheduled(scheduledTestID);
    const testID = scheduled.test_id;
    const lastExerciseID = await getLastExerciseID(testID);

    // last exercise, solved
    const [result] = await conn.execute(
        "select * from results where scheduled_test_id = ? "+
        "and user_id = ? and exercise_id = ?", [scheduledTestID, userID, lastExerciseID]
    );
    if(result.length>0){
        return false;
    }
    else{
        return true;
    }
}

export async function getMaxPoints(testID){
    const [exercises] = await conn.execute(
        "select exercise_id from tests_and_exercises where test_id = ?", [testID]
    );

    let points = 0;
    for(let i=0; i<exercises.length; i++){
        const temp = await exerciseModel.getNumberOfCorrectAnswers(exercises[i].exercise_id);
        points += temp;
    }
    return points;
}

export async function getPoints(scheduledTestID, userID){
    const scheduled = await getScheduled(scheduledTestID);
    console.log("getPoints:"+scheduledTestID);
    const testID = scheduled.test_id;
    let maxScore = await getMaxPoints(testID);
    let achievedScore = await resultModel.getTestResult(scheduledTestID, userID);
    return {maxScore, achievedScore};
}