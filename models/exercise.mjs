import { conn } from "../db/mysqlconn.mjs";

export async function getID(lessonID, exercisePos){
    const [exerciseTemp] = await conn.execute(
        "select exercise_id, exercise_text, exercise_position, image_id from exercises "+
        "where lesson_id = ? and exercise_position = ?", [lessonID, exercisePos]   
    );
    let exercise = exerciseTemp[0];
    return exercise.exercise_id;
}

export async function getType(exerciseID){
    const [exerciseTemp] = await conn.execute(
        "select exercise_type from exercises where exercise_id = ?", [exerciseID] 
    );
    return exerciseTemp[0].exercise_type;
}


export async function getNumberOfCorrectAnswers(exerciseID){
    const [result] = await conn.execute(
        "select count(*) as value from exercises e join answers a on a.exercise_id=e.exercise_id where "+
        "a.answer_flag=1 and e.exercise_id = ? ", [exerciseID]
    );
    return result[0].value;
}


export async function getByPosition(lessonID, exercisePos){
    const [exerciseTemp] = await conn.execute(
        "select exercise_id, exercise_text, exercise_position, image_id, exercise_type, exercise_direction from exercises "+
        "where lesson_id = ? and exercise_position = ?", [lessonID, exercisePos]   
    );
    let exercise = exerciseTemp[0];
    console.log(exercise);
    if(exercise.image_id !== null){
        const [image] = await conn.execute(
        "select i.image_object, i.image_text "+
        "from exercises e join images i on e.image_id = i.image_id "+
        "where e.lesson_id = ? and e.exercise_position = ?", [lessonID, exercisePos]  
        );
        console.log(image);
        exercise.image_object = image[0].image_object;
        exercise.image_text = image[0].image_text;
    }

    console.log(exercise);
    return exercise;
}

export async function getAnswers(exerciseID){
    const type = await getType(exerciseID);
    let answers = null;
    switch(type){
        case "check":
            answers = await getAnswersTypeCheck(exerciseID);
            break;
        case "ordering":
            answers = await getAnswersTypeOrdering(exerciseID);
            break;    
    }
    return answers;
}

export async function getAnswersTypeCheck(exerciseID){
    const [answers] = await conn.execute(
        "select a.answer_id, a.answer_text, i.image_object, i.image_text, a.answer_flag "+
        "from answers a join images i on a.image_id = i.image_id "+
        "where a.exercise_id = ?", [exerciseID]
    );
    return answers;
}

export async function getAnswersTypeOrdering(exerciseID){
    const [answers] = await conn.execute(
        "select a.answer_id, a.answer_text, i.image_object, i.image_text, a.answer_order "+
        "from answers a join images i on a.image_id = i.image_id "+
        "where a.exercise_id = ?", [exerciseID]
    );
    return answers;
}

export async function correct(exercise, type, answer){
    let result;
    switch(type){
        case "check":
            result = await correctAnswersTypeCheck(exercise, answer);
            break;
        case "ordering":
            result = await correctAnswersTypeOrdering(exercise, answer);
            break;    
    }
    return result;
}

export async function correctAnswersTypeCheck(exercise, answer){
    let checkedAnswers = answer;
    checkedAnswers=checkedAnswers.map(Number);
    let answers = await getAnswers(exercise.exercise_id);
    let checkedCorrectAnswers=0;
    const correctAnswers = await getNumberOfCorrectAnswers(exercise.exercise_id);
    for(let i=0; i<answers.length; i++){
        answers[i].checked = false; 
        if(answers[i].answer_flag == 1){
            if(checkedAnswers.includes(answers[i].answer_id)){
                answers[i].checked=true;
                checkedCorrectAnswers++;
            }
        }
        else{
            if(checkedAnswers.includes(answers[i].answer_id)){
                answers[i].checked=true;
            }
        }
    }
    return {points: checkedCorrectAnswers, answers: answers};
}

export async function correctAnswersTypeOrdering(exercise, answer){
    const answers = await getAnswersTypeOrdering(exercise.exercise_id);
    let correctOrder="";
    for(let i=0; i<answers.length; i++){
        correctOrder=correctOrder+answers[i].answer_id+" ";
    }
    console.log(answer+" "+typeof(answer));
    console.log(correctOrder+" "+typeof(correctOrder));

    let points=0;
    if(answer===correctOrder){
        points=1;
    }

    const numbersArray = answer.split(" ");
    const numbers = numbersArray.map(numString => parseInt(numString));
    // rebuild the user's ordering
    let userAnswer=[];
    
    for(let i=0; i<numbers.length; i++){
        for(let j=0; j<answers.length; j++){
            if(numbers[i]==answers[j].answer_id){
                userAnswer[userAnswer.length]=answers[j];
            }
        }
    }
    const tempAnswers = answers.concat(userAnswer);
    console.log(points);
    return {points, answers: tempAnswers};
}

