import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as classModel from "../models/class.mjs";
import * as studentModel from "../models/student.mjs";
import * as testModel from "../models/test.mjs";


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
    let testID = req.params.testID;
    if(req.method == 'POST'){
        type=req.body.type;
    }
    const types = await exerciseModel.getTypes();
    const exercises = await exerciseModel.getList(type, testID);
    res.render('searchExercise', {types, exercises, testID});
}


export async function chapters(req, res, next){
    const chapters = await queries.getChapters();
    for(let i=0; i<chapters.length; i++){
        chapters[i].lessons = await queries.getLessonsByChapter(chapters[i].chapter_id);
    }
    res.render('chaptersTeacher', {chapters});
}

export async function testsByLesson(req, res, next){
    const lessonID = req.params.lessonID;
    const tests = await testModel.getListByLesson(lessonID);
    res.render('tests', {tests});
}

export async function testByID(req, res, next){
    const testID = req.params.testID;
    const exercises = await exerciseModel.getByTestID(testID);
    res.render('testExercises', {exercises, testID});
}

export async function addExercises(req, res, next){
    const testID = req.params.testID;
    const exercises = req.body.exercise;
    if(Array.isArray(exercises)){
        for(let i=0; i<exercises.length; i++){
            let result = await testModel.addExercise(testID, exercises[i]);
        }
    }
    else{
        let result = await testModel.addExercise(testID, exercises);
    }
    const path = '/teacher/test/'+testID;
    res.redirect(path);
}