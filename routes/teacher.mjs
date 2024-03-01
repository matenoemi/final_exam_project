import express from 'express';
import * as teacherController from '../controllers/teacherController.mjs';
import { isAuth } from '../controllers/userController.mjs';

export const router = express.Router();

router.get('/results', isAuth(['teacher']), teacherController.results);
router.get('/classes', isAuth(['teacher']), teacherController.classes);
router.get('/students/:classID', isAuth(['teacher']), teacherController.studentsByClass);
router.get('/student/:studentID', isAuth(['teacher']), teacherController.studentByID);
router.get('/exercises/:testID', isAuth(['teacher']), teacherController.exercises);

router.post('/exercises/:testID', isAuth(['teacher']), teacherController.exercises);

router.get('/chapters', isAuth(['teacher']), teacherController.chapters);
router.get('/tests/:lessonID', isAuth(['teacher']), teacherController.testsByLesson);
router.get('/test/:testID', isAuth(['teacher']), teacherController.testByID);

router.post('/addExercises/:testID', isAuth(['teacher']), teacherController.addExercises);


