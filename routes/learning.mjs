import express from 'express';
import * as learningController from '../controllers/learningController.mjs';
import * as exampleController from '../controllers/exampleController.mjs'
import { isAuth } from '../controllers/userController.mjs';

export const router = express.Router();

router.get('/sort', isAuth(['student']), exampleController.sort);
router.get('/chapters', isAuth(['student']), learningController.chapters);
router.get('/lesson/:id', isAuth(['student']), learningController.lessonLearning);

router.get('/exercise/:lessonID/:exercisePos', isAuth(['student']), learningController.getExercise);
router.post('/exercise/:lessonID/:exercisePos', isAuth(['student']), learningController.correctAnswers);

router.get('/bits', exampleController.playWithBits);
router.get('/draganddrop', isAuth(['student']), exampleController.dragAndDrop);

router.get('/overview', isAuth(['teacher']), learningController.overview);


