import { mainMenu } from "../helpers/menus.mjs";
import * as queries from "../db/queries.mjs";
import { conn } from "../db/mysqlconn.mjs";

export async function overview(req, res, next){
  const results = await queries.resultsOverview();
  for(let i=0; i<results.length; i++){
    results[i].total=await queries.getNumberOfCorrectAnswers(results[i].exercise_id);
  }
  res.render('overview',{results});
}

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

export async function checkAnswers(req,res,next){
  let checkedAnswers = req.body.answer;
  console.log(checkedAnswers);
  checkedAnswers=checkedAnswers.map(Number);

  console.log(checkedAnswers);
  const lessonID = Number(req.params.lessonID);
  const exercisePos = Number(req.params.exercisePos);
  const exercise = await queries.getExercise(lessonID, exercisePos);
  let answers = await queries.getAnswers(exercise.exercise_id);
  let checkedCorrectAnswers=0;
  const correctAnswers = await queries.getNumberOfCorrectAnswers(exercise.exercise_id);
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
  const saveResult = await queries.saveResult(req.session.user, exercise.exercise_id, checkedCorrectAnswers);
  console.log(answers);
  console.log(correctAnswers);
  console.log(checkedCorrectAnswers);
  res.render('correctedExercise',{exercise, answers, lessonID, exercisePos, correctAnswers, checkedCorrectAnswers});
}

export async function getExercise(req, res, next){
  const lessonID = Number(req.params.lessonID);
  const exercisePos = Number(req.params.exercisePos)+1; 
  const exercise = await queries.getExercise(lessonID, exercisePos);
  console.log("exercise:"+exercise);
  const answers = await queries.getAnswers(exercise.exercise_id);
  res.render('exercise',{exercise, answers, lessonID, exercisePos});
}

export async function playWithBits(req,res,next){
  console.log("Bitsben");
  console.log(req.session.user);
  const imageID = 18;
  const [image] = await conn.execute(
    "select image_object from images where image_id = ?",[imageID]
  )
  res.render('bits',{image: image[0]});
}

export async function dragAndDrop(req,res,next){
  let [images] = await conn.execute(
    "select image_id, image_object from images where (image_id>=2 and image_id<=5) "+
    "or image_id = 10 or image_id = 13"
  );
  images = images.map(image => ({ ...image, type: "in" }));

  let [images1] = await conn.execute(
    "select image_id, image_object from images where image_id = 9 "+
    "or image_id = 12 or image_id = 14"
  );
  images1 = images1.map(image => ({ ...image, type: "in-out" }));

  let [images2] = await conn.execute(
    "select image_id, image_object from images where (image_id>=6 and image_id<=8) or "+
    "image_id = 11 "
  );
  images2 = images2.map(image => ({ ...image, type: "out" }));

  const allImages = [...images, ...images1, ...images2];
  const shuffledImages = shuffleArray(allImages);
  console.log(shuffledImages);
  res.render('draganddrop',{images: shuffledImages});
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export async function test(req, res, next){
  const lessonID = 2; const exercisePos = 3;
  const exercise = await queries.getExercise(2,3);
  const answers = await queries.getOrderingAnswers(exercise.exercise_id);
  res.render('ordering',{exercise, answers, lessonID, exercisePos});
}