import { conn } from "../db/mysqlconn.mjs";
import * as testModel from "../models/test.mjs";

export async function saveResult(user, exerciseID, correctAnswers, scheduledTestID){
    const [res] = await conn.execute(
        "insert into results(user_id, exercise_id, result_value, scheduled_test_id) values(?, ?, ?, ?)",
        [user.user_id, exerciseID, correctAnswers, scheduledTestID]
    );
    return res;
}

export async function getTestResult(scheduledTestID, userID){
    const [points] = await conn.execute(
        "select sum(result_value) as result from results where scheduled_test_id = ? "+
        "and user_id = ?", [scheduledTestID, userID]
    );
    return points[0].result;
}

export async function getClassResult(scheduledTestID){
    const scheduled = await testModel.getScheduled(scheduledTestID);
    const testID = scheduled.test_id;
    const lastExerciseID = await testModel.getLastExerciseID(testID);
    // solved
    let [list] = await conn.execute(
        "select r.user_id, u.user_name from results r join users u on u.user_id = r.user_id "+
        "where r.scheduled_test_id = ? "+
        "and r.exercise_id = ?", [scheduledTestID, lastExerciseID]
    );
    // score
    let score = 0;
    for(let i=0; i<list.length; i++){
        list[i].score = await getTestResult(scheduledTestID, list[i].user_id);
        score+=list[i].score;
    }
    return {list, score};
}
