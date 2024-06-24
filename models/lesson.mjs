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

export async function updatePosition(lessonID){
    for(let i=0; i<lessonID.length; i++){
        const pos = i+1;
        //console.log(pos, lessonID[i]);
        const [res] = await conn.execute(
            "update lessons set lesson_position = ? where lesson_id = ?", [pos, lessonID[i]]
        );
    }
}

export async function updateFlag(lessonID, flag){
    for(let i=0; i<lessonID.length; i++){
        if(!flag.includes(lessonID[i])){
            const [res] = await conn.execute(
                "update lessons set lesson_flag = 0 where lesson_id = ?", [lessonID[i]]
            );
        }
        else{
            const [res] = await conn.execute(
                "update lessons set lesson_flag = 1 where lesson_id = ?", [lessonID[i]]
            );
        }
    }
}

export async function getStudentList(id){
    const [lessons] = await conn.execute(
        "select lesson_id, lesson_flag, lesson_position, lesson_name from lessons where lesson_flag = 1 and chapter_id = ? order by lesson_position", [id]
    );
    return lessons;
}