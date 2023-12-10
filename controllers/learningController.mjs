import { mainMenu } from "../helpers/menus.mjs";
import * as queries from "../db/queries.mjs";
import { conn } from "../db/mysqlconn.mjs";

export async function sort(req, res, next) {
  res.render('sort', {
    menu: mainMenu,
  });
}

export async function chapters(req,res,next){
  const chapters = await queries.getChapters();
  console.log(chapters);
  for(let i=0; i<chapters.length; i++){
    const lessons = await queries.getLessonsByChapter(chapters[i].chapter_id);
    console.log(lessons);
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

export async function getExercise(req, res, next){
  console.log("GET exercise");
  const lessonID = Number(req.params.lessonID);
  const exercisePos = Number(req.params.exercisePos) + 1;
  const exercise = await queries.getExercise(lessonID, exercisePos);
  console.log("exercise:"+exercise);
  const answers = await queries.getAnswers(exercise.exercise_id);
  res.render('exercise',{exercise, answers, lessonID, exercisePos});
}

export async function playWithBits(req,res,next){
  const imageID = 18;
  const [image] = await conn.execute(
    "select image_object from images where image_id = ?",[imageID]
  )
  res.render('bits',{image: image[0]});
}

export async function dragAndDrop(){
  res.render();
}