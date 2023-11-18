import express from 'express';
import * as learningController from '../controllers/learningController.mjs';

export const router = express.Router();

router.get('/sort', learningController.sort);
router.get('/chapters',learningController.chapters);
router.get('/lesson/:id',learningController.lessonLearning);
