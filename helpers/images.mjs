import * as imageModel from "../models/image.mjs";

export async function getHelperImage(type){
    let imageID = null;
    switch(type){
        case "grouping": imageID = 195; break;
        case "ordering": imageID = 196; break;
        case "check": imageID = 197; break;
        case "radio": imageID = 198; break;
    }
    const image = await imageModel.getByID(imageID);
    return image;
}

export async function getDragImages(){
    let images = [];
    const image1 = await getHelperImage("grouping");
    const image2 = await getHelperImage("ordering");
    images.push(image1); images.push(image2);
    return images;
}

export async function getClickImages(){
    let images = [];
    const image1 = await getHelperImage("radio");
    const image2 = await getHelperImage("check");
    images.push(image1); images.push(image2);
    return images;
}