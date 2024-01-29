import express from 'express';
import * as learningController from '../controllers/learningController.mjs';
import { isAuth } from '../controllers/userController.mjs';

export const router = express.Router();

router.get('/sort', isAuth(['student']), learningController.sort);
router.get('/chapters', isAuth(['student']), learningController.chapters);
router.get('/lesson/:id', isAuth(['student']), learningController.lessonLearning);
router.get('/exercise/:lessonID/:exercisePos', isAuth(['student']), learningController.getExercise);

router.get('/bits',learningController.playWithBits);
router.get('/draganddrop', isAuth(['student']), learningController.dragAndDrop);