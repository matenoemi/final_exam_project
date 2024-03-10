import { conn } from "../db/mysqlconn.mjs";

export async function addNew(text, data){
    const [result] = await conn.execute(
        "insert into images (image_text, image_object) values(?, ?);", [text, data]
    );
    const [image] = await conn.execute(
        "select max(image_id) as image_id from images"
    )
    return image[0].image_id;
}

export async function getFour(){
    const [images] = await conn.execute(
        "select image_id, image_object from images order by image_id desc limit 4"
    );
    return images;
}