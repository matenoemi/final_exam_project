import express from 'express';
import * as learningController from '../controllers/learningController.mjs';
import * as exampleController from '../controllers/exampleController.mjs'
import { isAuth } from '../controllers/userController.mjs';

export const router = express.Router();

router.get('/sort', isAuth(['student']), exampleController.sort);
router.get('/chapters', isAuth(['student']), learningController.chapters);
router.get('/lesson/:id', isAuth(['student']), learningController.lessonLearning);

router.get('/sound/:soundFile', isAuth(['student']), learningController.play);
router.get('/exercise/:lessonID/:exercisePos', isAuth(['student']), learningController.getExercise);

router.post('/exercise/:lessonID/:exercisePos', isAuth(['student']), learningController.correctAnswers);

router.get('/bits', exampleController.playWithBits);
router.get('/draganddrop', isAuth(['student']), exampleController.dragAndDrop);

router.get('/courses', isAuth(['student']), learningController.courses);
router.get('/course/:courseID', isAuth(['student']), learningController.course);

router.get('/sounds', isAuth(['student']), learningController.sounds);
router.get('/:soundFile', isAuth(['student']), learningController.play);
