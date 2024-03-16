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
    const numbersArray = correctOrder.split(" ");
    const numbers = numbersArray.map(numString => parseInt(numString));
    console.log(numbers);
    for(let i=0; i<numbers.length-1; i++){
        const order = i+1;
        console.log(numbers[i]+" "+order+" "+exerciseID);
        const newAnswer = await setCorrectOrder(numbers[i], order, exerciseID);
    }
    return true;
}