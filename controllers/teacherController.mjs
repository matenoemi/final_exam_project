import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as classModel from "../models/class.mjs";
import * as studentModel from "../models/student.mjs";
import * as testModel from "../models/test.mjs";
import * as courseModel from "../models/course.mjs";
import * as imageModel from "../models/image.mjs"
import * as lessonModel from "../models/lesson.mjs";
import * as answerModel from "../models/answer.mjs";
import * as groupModel from "../models/group.mjs";

import { readFile } from "fs/promises";
import { join } from 'path';
import { TEMPDIR } from '../appdirs.mjs';

export async function results(req, res, next){
    const results = await queries.resultsOverview();
    for(let i=0; i<results.length; i++){
      results[i].total=await exerciseModel.getNumberOfCorrectAnswers(results[i].exercise_id);
    }
    res.render('overview', {results});
}

export async function classes(req, res, next){
    const classes = await classModel.getListByCourseID(req.session.course.courseID);
    res.render('classes', {classes});
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
    const testID = req.params.testID;
    const testName = await testModel.getName(testID);
    if(req.method == 'POST'){
        type=req.body.type;
    }
    const types = await exerciseModel.getTypes();
    const exercises = await exerciseModel.getList(type, testID);
    res.render('searchExercise', {types, exercises, testID, testName});
}


export async function chapters(req, res, next){
    const chapters = await queries.getChapters(req.session.course.courseID);
    for(let i=0; i<chapters.length; i++){
        chapters[i].lessons = await queries.getLessonsByChapter(chapters[i].chapter_id);
    }
    res.render('chaptersTeacher', {chapters});
}

export async function testsByLesson(req, res, next){
    const lessonID = req.params.lessonID;
    const tests = await testModel.getListByLesson(lessonID);
    res.render('tests', {tests, lessonID});
}

export async function testByID(req, res, next){
    const testID = req.params.testID;
    const testName = await testModel.getName(testID);
    const exercises = await exerciseModel.getByTestID(testID);
    res.render('testExercises', {exercises, testID, testName});
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

export async function newTest(req, res, next){
    const lessonID = req.params.lessonID;
    res.render('newTest', {lessonID});
}

export async function addNewTest(req, res, next){
    const lessonID = req.params.lessonID;
    const testName = req.body.testName;
    const result = await testModel.addToLesson(testName, lessonID);
    const path = '/teacher/tests/'+lessonID;
    res.redirect(path);
}

export async function selectMainType(req, res, next){
    const testID = req.params.testID;
    res.render('mainType', {testID});
}

export async function selectSecondType(req, res, next){
    const testID = req.params.testID;
    const type = req.body.type;
    switch(type){
        case 'click': res.render('clickTypes', {testID}); break;
        case 'drag': res.render('dragTypes', {testID}); break;
    }
}

export async function newExercise(req, res, next){
    const testID = req.params.testID;
    const types = await exerciseModel.getTypes();
    res.render('selectType', {testID, types});
}

export async function uploadClick(req, res, next){
    const testID = req.params.testID;
    const type = req.body.type;
    res.render('uploadClick', {testID, type});
}

export async function uploadDrag(req, res, next){
    const testID = req.params.testID;
    const type = req.body.type;
    res.render('uploadDrag', {testID, type});
}

export async function sendClickImages(req, res, next){
    const type = req.params.type;
    const testID = req.params.testID;
        let files=[];
        files[0] = req.files['upl1'][0];
        files[1] = req.files['upl2'][0];
        files[2] = req.files['upl3'][0];
        files[3] = req.files['upl4'][0];
        let errors = 0;
        for(let i=0; i<files.length; i++){
            try{
                const tempName = join(TEMPDIR,files[i].filename); 
                let data = await readFile(tempName);
                const result = await imageModel.addNew(files[i].filename, data, req.session.user.user_id);
            }
            catch(err){
                files[i].incorrect = true;
                errors++;
            }
        }
        const images = await imageModel.get(req.session.user.user_id, 4);
        res.render('setClick', {images, type, testID}); 
}

export async function sendDragImages(req, res, next){
    const type = req.params.type;
    const testID = req.params.testID;
    let files = req.files;
    for(let i=0; i<files.length; i++){
        try{
            const tempName = join(TEMPDIR,files[i].filename); 
            let data = await readFile(tempName);
            const result = await imageModel.addNew(files[i].filename, data, req.session.user.user_id);
        }
        catch(err){
            files[i].incorrect = true;
            errors++;
        }
    }
    const images = await imageModel.get(req.session.user.user_id, files.length);

    let direction = null;
    let groups = null;
    if(type=='ordering'){
        direction = req.body.direction;
        res.render('setOrdering', {testID, direction, images});
    }
    else{
        groups = req.body.groupName;
        groups = await groupModel.addList(groups);
        res.render('setGrouping', {testID, groups, images});
    }
}

export async function createGroupingExercise(req, res, next){
    console.log(req.body.answer);
    const testID = req.params.testID;
    const lessonID = await lessonModel.getByTest(testID);
    const exerciseID = await exerciseModel.addNewTypeGrouping(req.body.exerciseText, lessonID);
    const addToTest = await testModel.addExercise(testID, exerciseID);

    const groups = await groupModel.getList(req.body.answer.length);
    const insertAnswers = await answerModel.setCorrectAnswersTypeGrouping(req.body.answer, exerciseID, groups);

    const path = '/teacher/test/'+testID;
    res.redirect(path);
}

export async function createOrderingExercise(req, res, next){
    console.log(req.body.answer);
    const direction = req.params.direction;
    const testID = req.params.testID;
    const lessonID = await lessonModel.getByTest(testID);
    const exerciseID = await exerciseModel.addNewTypeOrdering(req.body.exerciseText, direction, lessonID);
   
    const addToTest = await testModel.addExercise(testID, exerciseID);
    const insertAnswers = await answerModel.setCorrectAnswersTypeOrdering(req.body.answer, exerciseID);

    const path = '/teacher/test/'+testID;
    res.redirect(path);
}

export async function createExercise(req, res, next){
    const type = req.params.type;
    const testID = req.params.testID;
    const lessonID = await lessonModel.getByTest(testID);

    const exerciseID = await exerciseModel.addNew(req.body.exerciseText, type, lessonID);
    const addToTest = await testModel.addExercise(testID, exerciseID);

    // answers to exercise
    const answers = req.body.answer;
    const correctAnswers = req.body.correctAnswer;

    const insertAnswers = await answerModel.insertAnswersTypeCheck(answers, exerciseID);
    const setCorrectAnswers = await answerModel.setCorrectAnswersTypeCheck(correctAnswers, exerciseID);

    const path = '/teacher/test/'+testID;
    res.redirect(path);
}

export async function courses(req, res, next){
    const courses = await courseModel.getTeacherList(req.session.user.user_id);
    res.render('courses', {courses});
}

export async function course(req, res, next){
    const courseID = req.params.courseID;
    const courseName = await courseModel.getByID(courseID);
    req.session.course = {courseID: courseID, courseName: courseName};
  
    req.session.save( function(err) {
      req.session.reload( function (err) {
        res.redirect('/teacher/chapters');
      });
    });
}

export async function newCourse(req, res, next){
    res.render('newCourse');
}

export async function addNewCourse(req, res, next){
    const defaultImageID = 170;
    const im=req.file;
    const courseName = req.body.courseName;
    try{
        const tempName = join(TEMPDIR,im.filename); 
        const data = await readFile(tempName);
        const imageID = await imageModel.addNew(courseName, data);
        const courseID = await courseModel.addNew(courseName, imageID);
        const result = await courseModel.addTeacher(courseID, req.session.user.user_id);
    }
    catch(e){
        const courseID = await courseModel.addNew(courseName, defaultImageID);
        const result = await courseModel.addTeacher(courseID, req.session.user.user_id);
    }
    res.redirect('/teacher/courses');
}

export async function classToCourse(req, res, next){
    const classes = await classModel.getListToCourse(req.session.course.courseID);
    res.render('classToCourse', {classes});
}

export async function addClassToCourse(req, res, next){
    const result = await courseModel.addClass(req.body.class, req.session.course.courseID);
    res.redirect('/teacher/classes');
}