import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as courseModel from "../models/course.mjs";
import * as testModel from "../models/test.mjs";
import { createReadStream } from "fs";
import { statSync } from "fs";
import { join } from 'path';
import { __dirname } from '../dirname.mjs';


export async function play(req, res, next){
  console.log("play meghivva");
  const tempName = join(__dirname, "/sounds/", req.params.soundFile); 
  let music = tempName;
  let stat = statSync(music);

  res.header({
    'Content-Type': 'audio/mpeg',
    'Content-Length': stat.size
  });
  let readStream = createReadStream(music);
  readStream.pipe(res);
}

export async function sounds(req, res, next){
  res.render('play');
}

export async function chapters(req,res,next){
  const chapters = await queries.getChapters(req.session.course.courseID);
  for(let i=0; i<chapters.length; i++){
    const lessons = await queries.getLessonsByChapter(chapters[i].chapter_id);
    chapters[i].lessons=lessons;
    for(let j=0; j<chapters[i].lessons.length; j++){
      const test = await testModel.getByLessonID(chapters[i].lessons[j].lesson_id, req.session.user.class_id);
      chapters[i].lessons[j].test = test;
    }
  }
  res.render('chapters',{
    chapters
  });
}

export async function lessonLearning(req, res, next) {
  const lessonID = req.params.id;
  const slides = await queries.getSlidesByLesson(lessonID);
  res.render('slide',{slides, lessonID});
}

export async function correctAnswers(req,res,next){
  let isTest = false;
  const path = req.path;
  const array = path.split('/');
  let exercise = null; let lessonID = null; let exercisePos = null;
  let scheduledTestID = null; let exerciseID = null;

  if(array[1]=="exercise"){
    lessonID = Number(req.params.lessonID);
    exercisePos = Number(req.params.exercisePos);
    exercise = await exerciseModel.getByPosition(lessonID, exercisePos);
  }
  else{
    isTest = true;
    scheduledTestID = req.params.scheduledTestID;
    exerciseID = req.params.exerciseID;
    exercise = await exerciseModel.getExerciseByID(exerciseID);
    const nextExercise = await testModel.getNextExercise(scheduledTestID, exerciseID);
    console.log(nextExercise);
    exerciseID = nextExercise.exercise_id;
  }

  const type = await exerciseModel.getType(exercise.exercise_id);
  const answer = req.body.answer;
  const result = await exerciseModel.correct(exercise, type, answer);
  const points = result.points;
  const answers = result.answers;
  const correctAnswers = await exerciseModel.getNumberOfCorrectAnswers(exercise.exercise_id);
  const saveResult = await queries.saveResult(req.session.user, exercise.exercise_id, points);

  let groups = null;
  if(type == 'grouping'){
    groups = result.groups;
  }
  const file = 'corrected' + type.charAt(0).toUpperCase() + type.slice(1)
  res.render(file, {exercise, answers, groups, lessonID, exercisePos, correctAnswers, points, scheduledTestID, isTest, exerciseID});
}

export async function getExercise(req, res, next){
  let isTest = false;
  const path = req.path;
  const array = path.split('/');
  let exercise = null; let lessonID = null; let exercisePos = null;
  let scheduledTestID = null; let exerciseID = null;

  if(array[1]=="exercise"){
    lessonID = Number(req.params.lessonID);
    exercisePos = Number(req.params.exercisePos)+1; 
    exercise = await exerciseModel.getByPosition(lessonID, exercisePos);
  }
  else{
    isTest = true;
    scheduledTestID = req.params.scheduledTestID;
    exerciseID = req.params.exerciseID;
    exercise = await exerciseModel.getExerciseByID(exerciseID);
  }

  let answers = await exerciseModel.getAnswers(exercise.exercise_id);
  if(exercise.exercise_type=='ordering'){
    answers = shuffleArray(answers);
  }
  const file = await exerciseModel.getType(exercise.exercise_id)
  res.render(file,{exercise, answers, lessonID, exercisePos, isTest, scheduledTestID});
}

export async function courses(req, res, next){
  const courses = await courseModel.getStudentList(req.session.user.user_id);
  res.render('courses', {courses});
}

export async function course(req, res, next){
  const courseID = req.params.courseID;
  const courseName = await courseModel.getByID(courseID);
  req.session.course = {courseID: courseID, courseName: courseName};
  req.session.save( function(err) {
    req.session.reload( function (err) {
      res.redirect('/learn/chapters');
    });
  });
}

export async function testMainPage(req, res, next){
  const scheduled = await testModel.getScheduled(req.params.scheduledTestID);
  const exerciseID = await testModel.getFirstExerciseID(scheduled.test_id);
  res.render('testMainPage', {scheduled, exerciseID});
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}