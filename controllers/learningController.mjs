import * as queries from "../db/queries.mjs";
import * as exerciseModel from "../models/exercise.mjs";
import * as courseModel from "../models/course.mjs";


export async function chapters(req,res,next){
  const chapters = await queries.getChapters(req.session.course.courseID);
  //console.log(chapters);
  for(let i=0; i<chapters.length; i++){
    const lessons = await queries.getLessonsByChapter(chapters[i].chapter_id);
    //console.log(lessons);
    chapters[i].lessons=lessons;
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
  const lessonID = Number(req.params.lessonID);
  const exercisePos = Number(req.params.exercisePos);
  const exercise = await exerciseModel.getByPosition(lessonID, exercisePos);
  const type = await exerciseModel.getType(exercise.exercise_id);
  const answer = req.body.answer;
  const result = await exerciseModel.correct(exercise, type, answer);
  const points = result.points;
  const answers = result.answers;

  const saveResult = await queries.saveResult(req.session.user, exercise.exercise_id, points);

  switch(type){
    case "check":
      res.render('correctedCheck', {exercise, answers, lessonID, exercisePos, correctAnswers: 3, points});
      break;
    case "ordering":
      res.render('correctedOrdering', {exercise, answers, lessonID, exercisePos, correctAnswers: 1, points});
      break;
    case "grouping":
      res.render('correctedGrouping', {exercise, answers, groups: result.groups, lessonID, exercisePos, correctAnswers: 9, points});
      break;
    case "radio":
      res.render('correctedRadio', {exercise, answers, lessonID, exercisePos, correctAnswers: 1, points})
  }

}

export async function getExercise(req, res, next){
  const lessonID = Number(req.params.lessonID);
  const exercisePos = Number(req.params.exercisePos)+1; 
  const exercise = await exerciseModel.getByPosition(lessonID, exercisePos);
  let answers = await exerciseModel.getAnswers(exercise.exercise_id);
  answers = shuffleArray(answers);
  console.log(answers);
  const file = await exerciseModel.getType(exercise.exercise_id)
  res.render(file,{exercise, answers, lessonID, exercisePos});
}

export async function courses(req, res, next){
  const courses = await courseModel.getStudentList(req.session.user.user_id);
  res.render('courses', {courses});
}
export async function course(req, res, next){
  const courseID = req.params.courseID;
  const courseName = await courseModel.getByID(courseID);
  req.session.course = {courseID: courseID, courseName: courseName};
  //console.log("Function: "+req.session.course.courseName);

  req.session.save( function(err) {
    req.session.reload( function (err) {
      res.redirect('/learn/chapters');
    });
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}