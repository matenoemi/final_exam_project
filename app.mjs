import express from 'express';
import http from 'http';
import { join } from 'path';
import expressLayouts from 'express-ejs-layouts';
import httpStatus from 'http-status-codes';
import morgan from 'morgan';
import axios from 'axios';

import { __dirname } from './dirname.mjs';
import { mainMenu } from "./helpers/menus.mjs";

import session from "express-session";
import filestore from "session-file-store";

import multer from 'multer';

const app = express();

app.use(morgan("dev")); 

//post adatok átvevése
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

import { TEMPDIR } from './appdirs.mjs'; 
const mUploads = multer({ dest: TEMPDIR });

app.use('/css', express.static(join(__dirname, 'assets/css')))
app.use('/js', express.static(join(__dirname, 'assets/js')))

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set('layout', 'layouts/layout');



const FileStore = filestore(session);
app.use(
  session({
    store: new FileStore(),
    secret: "StrangerThings",
    resave: true,
    saveUninitialized: true,
    cookie: {                 
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.locals.mainMenu = mainMenu; 

app.use((req, res, next)=>{
  if(req.session.user){
    res.locals.user=req.session.user;
    if(req.session.course){
    res.locals.course = req.session.course;
    console.log(res.locals.course.courseName);
    }
    else{
      res.locals.course = null;
    }
  }else{
    res.locals.user=null;
    res.locals.course = null;
  }
  next();
})

// Handle chat requests
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-proj-LV4otlmZXKaPQcWQgJmBT3BlbkFJaqWZ7QtybG7zhFy1YkwZ`
      }
    });

    const botResponse = response.data.choices[0].message.content;
    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
});


import { router as indexRouter } from './routes/index.mjs';
import { router as learningRouter }  from './routes/learning.mjs';
import { router as userRouter }  from './routes/user.mjs';
import { router as teacherRouter } from './routes/teacher.mjs';
import { router as adminRouter } from './routes/admin.mjs';

app.use('/', indexRouter);
app.use('/learn', learningRouter);
app.use('/user', userRouter);
app.use('/teacher', teacherRouter);
app.use('/admin', adminRouter);


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

