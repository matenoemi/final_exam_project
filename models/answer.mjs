import { conn } from "../db/mysqlconn.mjs";

export async function insertAnswersTypeCheck(answers, exerciseID){
    for(let i=0; i<answers.length; i++){
        const [result] = await conn.execute(
            "insert into answers (image_id, exercise_id) values (?, ?)", [answers[i], exerciseID]
        );
    }
    return true;
}

async function setCorrectAnswer(answer, exerciseID){
    const [result] = await conn.execute(
        "update answers set answer_flag = 1 where image_id = ? and exercise_id = ?", [answer, exerciseID]
    );
    return true;
}

async function setCorrectOrder(imageID, answerOrder, exerciseID){
    const [result] = await conn.execute(
        "insert into answers(image_id, answer_order, exercise_id) "+
        "values(?, ?, ?) ", [imageID, answerOrder, exerciseID]
    );
    return true;
}

export async function setCorrectAnswersTypeCheck(answers, exerciseID){
    if(Array.isArray(answers)){
        for(let i=0; i<answers.length; i++){
            const result = await setCorrectAnswer(answers[i], exerciseID);
        }
    }
    else{
        const result = await setCorrectAnswer(answers, exerciseID);
    }
    return true;
}

export async function setCorrectAnswersTypeOrdering(correctOrder, exerciseID){
    correctOrder = correctOrder.trim();
    const numbersArray = correctOrder.split(" ");
    const numbers = numbersArray.map(numString => parseInt(numString));
    console.log(numbers);
    for(let i=0; i<numbers.length; i++){
        const order = i+1;
        console.log(numbers[i]+" "+order+" "+exerciseID);
        const newAnswer = await setCorrectOrder(numbers[i], order, exerciseID);
    }
    return true;
}

async function setCorrectGroup(imageID, groupID, exerciseID){
    const [result] = await conn.execute(
        "insert into answers(image_id, group_id, exercise_id) values(?, ?, ?)", [imageID, groupID, exerciseID]
    );
    return result;
}

export async function setCorrectAnswersTypeGrouping(answer, exerciseID, groups){
    for(let i=0; i<answer.length; i++){
        answer[i]=answer[i].trim();
        const numbersArray = answer[i].split(" ");
        const numbers = numbersArray.map(numString => parseInt(numString));
        // group i: images: ...
        // group i+1: images: ...
        answer[i]=numbers;
    }
    console.log(answer);
    for(let i=0; i<groups.length; i++){
        const array = answer[i];
        for(let j=0; j<array.length; j++){
            // image ids
            console.log(array[j]+" "+groups[i].group_id+" "+exerciseID);
            const result = await setCorrectGroup(array[j], groups[i].group_id, exerciseID);
        }
    }
    return true;
}