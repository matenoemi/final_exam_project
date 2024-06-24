import { conn } from "../db/mysqlconn.mjs";
import Joi from "joi";
import { getRoles } from "../helpers/roles.mjs";
import { createHash } from "crypto";
import debugMsg from 'debug';
const debug = debugMsg('app:userController'); 
import * as courseModel from "../models/course.mjs";

export async function endConn() {
  await conn.end();
}

//bejelentkezési  adatok
function checkLogin(user) {
  console.log(user);
  const schema = Joi.object({
    email: Joi.string()
      //.pattern(/^([a-z0-9_]|\-|\.)+@(([a-z0-9_]|\-)+\.)+[a-z]{2,10}$/i)
      .required()
      .messages({ "string.pattern.base": "Az email cím hibás" }),
    password: Joi.string().min(1).max(100).required(),
  });
  const result = schema.validate(user);
  
  return result;
}

export const isAuth = (role) => {  //egyik technika arra nézve, hogy a middleware 3-nál több paramétert kapjon
  return async (req, res, next) => {
   // debug(`auth ellenőrzés:%o`,req.session.user);
    if (req.session.user) { //be van jelentkezve
      if (! (role instanceof Array)){ //programozási hiba 
         return next(new Error("isAuth hibás paraméter1"));
      }
      if (role.length===0){ //bejelentkezett felhasználó és nem kell szerepkört ellenőrizni
       //  debug(`auth ellenőrzés, szerep nélkül: %s`,req.session.user.role);
         return next();
      }

      //ellenőrzés, helyes-e a függvény paraméter
      //a felsorolt szerepek benne vannak az adatbázisban  
      const roles = getRoles();
      const check = role.every( r => roles.includes(r));
      if (!check) return next(new Error("isAuth hibás paraméter2"));


      if (role.includes(req.session.user.user_role)){//rendelkezik megfelelő szerepkörrel 
      //  debug(`auth ellenőrzés, szerep: %s`,req.session.user.role);
        return next();
      }
     // debug(`auth ellenőrzés, szerep: %s nincs jogosultság`,req.session.user.role);
      return next("router");//nincs jogosultsága
    } else {
     // debug(`auth ellenőrzés, szerep:  nincs bejelentkezve`);
      res.redirect('/user/login'); //jelentkezzen be

    }
  }
}


//GET kérés kiszolgálása a bejelentkezéshez
//űrlap kiküldés
export async function login(req, res, next) {
  if (req.session.user) {
    //ha be van jelentkezve
    res.render("message", {
      message: "Be van jelentkezve!",
    });
  } else {
    res.render("login", {
      userData: {
        email: "",
      },
      error: "",
    });
  }
}

//POST kérés kiszolgálása a bejelentkezéshez
//űrlap fogadás és bejelentkezés
export async function postLogin(req, res, next) {

  const userData = req.body;
  delete userData.submit;

  debug(`login próbálkozás: %o`, userData);
  //ellenőrzés
  const result = checkLogin(userData);

  if (result.error) {
    res.render("login", {
      userData: userData,
      error: result.error.message,
    });
    return;
  }
  //a jelszónak a sha1 hash kódját kell ellenőrizni, az van eltárolva
  const hash = createHash("sha1").update(userData.password).digest("hex");
  let rows = null;
  let fields = null;
  try {
    [rows, fields] = await conn.execute(
      "SELECT user_id, user_email, user_name, user_role, class_id FROM users WHERE user_email = :email AND user_password = :hash",
      {
        email: userData.email,
        hash: hash,
      }
    );
  } catch (err) {
    next(err);
    return;
  }

  //egy sort várunk, bejelentkezés nem sikerült
  if (rows.length != 1) {
    res.render("login", {
      userData: {
        email: userData.email,
      },
      error: "Bejelentkezés nem sikerült, nincs ilyen név/jelszó pár.",
    });
    return;
  }

  let courses;
  switch(rows[0].user_role){
    case 'student':
      courses = await courseModel.getStudentList(rows[0].user_id);
      break;
    case 'teacher':
      courses = await courseModel.getTeacherList(rows[0].user_id);
      break;
  }
  
  //sikeres bejelentkezés
  //töröljük a szesszió eddigi adatait
  req.session.regenerate(function (err) {
    if (err) next(err);

    //a felhasználó adatai tárolódnak a szesszióban
    req.session.user = rows[0];
    if(courses != undefined){
    if(courses.length>0){
      req.session.course = {courseID: courses[0].course_id, courseName: courses[0].course_name};
    }
  }
    
    debug(`login ok: %o`,req.session.user);
    //kimentjük a szesszió adatokat, ha jön egy új kérés mielőtt
    //ez a függvény kilép, az már az új adatokat találja
    req.session.save(function (err) {
      if (err) return next(err);
      //átléptetjük a felhasználót a fő oldalra

      if(rows[0].user_role=='admin'){
        res.redirect("/");
        return
      }

      if(courses.length==0){
        res.redirect("/");
        return
      }
      
      switch(req.session.user.user_role){
        case 'student':
          res.redirect("/learn/courses");
          break;
        case 'teacher':
          res.redirect("/teacher/courses");  
          break;
        default:
          res.redirect("/");
      }
    });
  });
}

//kijelentkezés
export async function logout(req, res, next) {
  debug(`logout %o`,req.session.user);
  //töröljük a felhasználó adatait a szesszióból
  req.session.user = null;
  //mentjük a szesszió adatokat
  req.session.save(function (err) {
    if (err) return next(err);
    //újra indítjuk a szesszió belső adatait
    req.session.regenerate(function (err) {
      if (err) return next(err);
      //a főoldalra kerül kijelentkezve
      res.redirect("/");
    });
  });
}

export async function profile(req, res, next){
  const userID = req.session.user.user_id;
  res.render('profile');
}
