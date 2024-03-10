import { conn } from "../db/mysqlconn.mjs";

export async function getByTest(testID){
    const [lesson] = await conn.execute(
        "select lesson_id from tests where test_id = ?", [testID]
    );
    return lesson[0].lesson_id;
}