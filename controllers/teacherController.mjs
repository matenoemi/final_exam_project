import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as classModel from "../models/class.mjs";
import * as studentModel from "../models/student.mjs";


export async function results(req, res, next){
    const results = await queries.resultsOverview();
    for(let i=0; i<results.length; i++){
      results[i].total=await exerciseModel.getNumberOfCorrectAnswers(results[i].exercise_id);
    }
    res.render('overview',{results});
}

export async function classes(req, res, next){
    const classes = await classModel.getList(req.session.user.user_id);
    res.render('classes',{classes});
}

export async function studentsByClass(req, res, next){
    const students = await studentModel.getListByClass(req.params.classID);
    res.render('students',{students});
}

export async function studentByID(req, res, next){
    const student = await studentModel.getByID(req.params.studentID);
    res.render('student', {student});
}

export async function exercises(req, res, next){
    let type = null;
    if(req.method == 'POST'){
        type=req.body.type;
    }
    const types = await exerciseModel.getTypes();
    const exercises = await exerciseModel.getList(type);
    console.log(exercises);
    res.render('searchExercise', {types, exercises});
}