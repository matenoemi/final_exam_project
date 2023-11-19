import { mainMenu } from "../helpers/menus.mjs";
import * as queries from "../db/queries.mjs";

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
  const lessonId = req.params.id;
  const slides = await queries.getSlidesByLesson(lessonId);
  res.render('slide',{slides});
}