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
    //console.log(exercise);
    if(exercise.image_id !== null){
        const [image] = await conn.execute(
        "select i.image_object, i.image_text "+
        "from exercises e join images i on e.image_id = i.image_id "+
        "where e.lesson_id = ? and e.exercise_position = ?", [lessonID, exercisePos]  
        );
        //console.log(image);
        exercise.image_object = image[0].image_object;
        exercise.image_text = image[0].image_text;
    }

    //console.log(exercise);
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
        case "grouping":
            answers = await getAnswersTypeGrouping(exerciseID);  
            break;
        case "radio":
            answers = await getAnswersTypeCheck(exerciseID);
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
        "where a.exercise_id = ? order by a.answer_order", [exerciseID]
    );
    return answers;
}

export async function getAnswersTypeGrouping(exerciseID){
    const [items] = await conn.execute(
        "select a.answer_id, a.group_id, i.image_object, i.image_text "+
        "from answers a join images i on a.image_id = i.image_id "+
        "where a.exercise_id = ?", [exerciseID]
    );

    const [groups] = await conn.execute(
        "select distinct g.group_id, g.group_name from answers a join groups g "+
        "on a.group_id = g.group_id where a.exercise_id = ? order by 1", [exerciseID]
    );

    return {items, groups};
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
        case "grouping":
            result = await correctAnswersTypeGrouping(exercise, answer);
            break;
        case "radio":
            result = await correctAnswersTypeRadio(exercise, answer);
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
    //console.log(answer+" "+typeof(answer));
    //console.log(correctOrder+" "+typeof(correctOrder));

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
    //console.log(points);
    return {points, answers: tempAnswers};
}

export async function correctAnswersTypeGrouping(exercise, answer){
    for(let i=0; i<answer.length; i++){
        const numbersArray = answer[i].split(" ");
        const numbers = numbersArray.map(numString => parseInt(numString));
        answer[i]=numbers;
    }
    const temp = await getAnswersTypeGrouping(exercise.exercise_id);
    const groups = temp.groups;
    let answers = temp.items;
    let points = 0;

    for(let i=0; i<groups.length; i++){
        const array = answer[i];
        for(let j=0; j<array.length; j++){
            for(let k=0; k<answers.length; k++){
                if(array[j] == answers[k].answer_id){
                    answers[k].selectedGroup = groups[i].group_id;
                    if(answers[k].selectedGroup == answers[k].group_id){
                        points++;
                    }
                }
            }
        }
    }
    //console.log(answers);
    return {points, answers, groups};
}

export async function correctAnswersTypeRadio(exercise, answer){
    let answers = await getAnswersTypeCheck(exercise.exercise_id);
    let points = 0;
    for(let i=0; i<answers.length; i++){
        if(answers[i].answer_id == answer){
            answers[i].checked = true;
            if(answers[i].answer_flag){
                points=1;
            }
        }
    }
    return {points, answers};
}

export async function getTypes(){
    const [types] = await conn.execute(
        "select distinct exercise_type as type from exercises"
    );
    //console.log(types);
    return types;
}

export async function getList(type, testID){
    const [lessonID] = await conn.execute("select lesson_id from tests where test_id = ?", [testID]);
    let exercises = null;
    if(type){
        [exercises] = await conn.execute(
            "select * from exercises where exercise_type = ?", [type]
        );
    }
    else{
        [exercises] = await conn.execute(
            "select * from exercises where lesson_id = ? and exercise_id not in "+
            "(select exercise_id from tests_and_exercises where test_id = ?) ", [lessonID[0].lesson_id, testID]
        );
    }
    for(let i=0; i<exercises.length; i++){
        exercises[i].answers = await getAnswers(exercises[i].exercise_id);
    }
    return exercises;
}

export async function getExerciseByID(exerciseID){
    const [exercise] = await conn.execute(
        "select * from exercises where exercise_id = ?", [exerciseID]);
    return exercise[0];
}

export async function getByTestID(testID){
    let [exerciseIDs] = await conn.execute(
        "select exercise_id from tests_and_exercises where test_id = ? ", [testID]
    );
    const idArray = exerciseIDs.map(exercise => exercise.exercise_id);
    let exercises = [];
    for(let i=0; i<idArray.length; i++){
        exercises[i]= await getExerciseByID(idArray[i]);
    }
    for(let i=0; i<exercises.length; i++){
        exercises[i].answers = await getAnswers(exercises[i].exercise_id);
    }
    return exercises;
}

