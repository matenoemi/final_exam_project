import { conn } from "../db/mysqlconn.mjs";

export async function addNew(text, data, userID){
    const [result] = await conn.execute(
        "insert into images (image_text, image_object, teacher_id) values(?, ?, ?);", [text, data, userID]
    );
    const [image] = await conn.execute(
        "select max(image_id) as image_id from images"
    )
    return image[0].image_id;
}

export async function get(teacherID, limitValue){
    const [images] = await conn.execute(
        "select image_id, image_object from images where teacher_id = ? "+
        "order by image_id desc limit ?", [teacherID, limitValue]
    );
    return images;
}

export async function getByID(imageID){
    const [images] = await conn.execute(
        "select image_object from images where image_id = ?", [imageID]
    );
    return images[0];
}