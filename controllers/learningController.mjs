import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as courseModel from "../models/course.mjs";
import * as testModel from "../models/test.mjs";
import * as resultModel from "../models/result.mjs";
import * as lessonModel from "../models/lesson.mjs";
import * as imageModel from "../models/image.mjs"
import * as chapterModel from "../models/chapter.mjs";
import { createReadStream } from "fs";
import { statSync } from "fs";
import { join } from 'path';
import { __dirname } from '../dirname.mjs';


export async function play(req, res, next){
  console.log("play meghivva "+req.path);
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

export async function chapter(req, res, next){
  const lessonImage = await imageModel.getLessonIcon();
  const testImage = await imageModel.getTestIcon();
  const chapterID = req.params.chapterID;
  const chapterName = await chapterModel.getNameByID(chapterID);
  const lessons = await lessonModel.getStudentList(chapterID);
    
  for(let j=0; j<lessons.length; j++){
    const tests = await testModel.getByLessonID(lessons[j].lesson_id, req.session.user.class_id);
    lessons[j].tests = tests;
  }

  res.render('chapter', {lessons, testImage, lessonImage, chapterName})
}

export async function chapters(req,res,next){
  const chapterImage = await imageModel.getChapterIcon();
  
  const chapters = await queries.getChapters(req.session.course.courseID);
  res.render('chapters',{
    chapters, chapterImage
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
  let isLast = false;
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
    if(!nextExercise){
      isLast = true;
    }
    exerciseID = nextExercise.exercise_id;
  }

  const type = await exerciseModel.getType(exercise.exercise_id);
  const answer = req.body.answer;
  const result = await exerciseModel.correct(exercise, type, answer);
  const points = result.points;
  const answers = result.answers;
  const correctAnswers = await exerciseModel.getNumberOfCorrectAnswers(exercise.exercise_id);
  const saveResult = await resultModel.saveResult(req.session.user, exercise.exercise_id, points, scheduledTestID);

  let groups = null;
  if(type == 'grouping'){
    groups = result.groups;
  }
  const file = 'corrected' + type.charAt(0).toUpperCase() + type.slice(1)
  res.render(file, {exercise, answers, groups, lessonID, exercisePos, correctAnswers,
    points, scheduledTestID, isTest, exerciseID, isLast, userID: req.session.user.user_id});
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
    if(exercise === undefined){
      res.render('lastExercise',{lessonID});
      return;
    }
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
  const isActive = await testModel.isActive(req.params.scheduledTestID);

  // is not solved
  const isSolvable = await testModel.isSolvable(req.params.scheduledTestID, req.session.user.user_id);
  res.render('testMainPage', {scheduled, exerciseID, isSolvable, isActive,
    userID: req.session.user.user_id});
}

export async function testResults(req, res, next){
  const userID = req.params.userID;
  const scheduledTestID = req.params.scheduledTestID;
  const score = await testModel.getPoints(scheduledTestID, userID);
  const maxScore = score.maxScore;
  const achievedScore = score.achievedScore;
  const percentage = ((achievedScore*100)/maxScore).toFixed(1);
  res.render('userResult', {maxScore, achievedScore, percentage});
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
