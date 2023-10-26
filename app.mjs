import express from 'express';
import http from 'http';
import { join } from 'path';
import expressLayouts from 'express-ejs-layouts';
import httpStatus from 'http-status-codes';
import morgan from 'morgan';

import { __dirname } from './dirname.mjs';
import { mainMenu } from "./helpers/menus.mjs";

const app = express();

app.use(morgan("dev")); 

//post adatok átvevése
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/css', express.static(join(__dirname, 'assets/css')))
app.use('/js', express.static(join(__dirname, 'assets/js')))

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

//szessziókezelő modul
import session from "express-session";
import filestore from "session-file-store";
const FileStore = filestore(session); //szesszió adatok fájlban tárolva
app.use(
  session({
    store: new FileStore(), //állományba kerül kimentésre a session objektum
    secret: "Nilus macska titkos 🔑-a", //a sütik aláírására használt kulcs
    resave: true,         //szesszió adatok mentésére megadott opciók
    saveUninitialized: true,
    cookie: {                 //szesszió lejárati ideje
      maxAge: 1000 * 60 * 30, //1 sec * 60 * 30 = 30 perc
    },
  })
);

app.locals.mainMenu = mainMenu; 

//res.locals egy kérés idejére
//ez lefut minden kérésre az útvonalaink előtt
app.use((req, res, next)=>{
  if(req.session.user){
    res.locals.user=req.session.user;
  }else{
    res.locals.user=null;
  }
  next();
})

import { router as indexRouter } from './routes/index.mjs';
import { router as learningRouter }  from './routes/learning.mjs';


// útvonalválasztók
app.use('/', indexRouter);
app.use('/it', learningRouter);


app.use((req, res)=>{
  const err = httpStatus.NOT_FOUND;
  console.log(`Rossz webcím: ${req.path}`);
  const error = httpStatus.NOT_FOUND; //404
  res.status(error).send(`${error} Rossz webcím`);
});

app.use((err, req, res, next)=>{
  console.error(err.message);
  const error = httpStatus.INTERNAL_SERVER_ERROR; // 500
  res.status(error).send(`${error} Hibába futott az alkalmazás.`); 
});

const server = http.createServer(app);

server.listen(3000, ()=>{
  console.log("szerver fut a 3000-esen");
});