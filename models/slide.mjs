import { conn } from "../db/mysqlconn.mjs";
import * as imageModel from "../models/image.mjs";


export async function addNew(slideText, image, videoUrl, lessonID, teacherID, fileName){
    const [pos] = await conn.execute(
        "select max(slide_position) as pos from slides where lesson_id = ?", [lessonID]
    )
    const position = pos[0].pos+1;

    let imageID = null; let result = null;
    if(image != null){
        imageID = await imageModel.addNew(fileName, image, teacherID);
        result = await addWithImage(slideText, position, imageID, lessonID);
    }
    else{
        result = await addWithVideo(slideText, position, videoUrl, lessonID);
    }
    return result;
}

async function addWithImage(slideText, position, imageID, lessonID){
    const [result] = await conn.execute(
        "insert into slides(slide_text, slide_position, image_id, lesson_id) values (?, ?, ?, ?)",
        [slideText, position, imageID, lessonID]
    );
    return result;
}

async function addWithVideo(slideText, position, videoUrl, lessonID){
    const [result] = await conn.execute(
        "insert into slides(slide_text, slide_position, video_url, lesson_id) values (?, ?, ?, ?)",
        [slideText, position, videoUrl, lessonID]
    );
    return result;
}