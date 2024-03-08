import express from 'express';
import * as teacherController from '../controllers/teacherController.mjs';
import { isAuth } from '../controllers/userController.mjs';

import multer from 'multer';
import { TEMPDIR } from '../appdirs.mjs';
const mUploads = multer({ dest: TEMPDIR });

//const uploadImages = mUploads.array('upl');

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
router.get('/addNewTest/:lessonID', isAuth(['teacher']), teacherController.newTest);
router.post('/addNewTest/:lessonID', isAuth(['teacher']), teacherController.addNewTest);

router.get('/addNewExercise/:testID', isAuth(['teacher']), teacherController.newExercise);
router.post('/addNewExercise/:testID', isAuth(['teacher']), mUploads.single('upl'), teacherController.uploadImages);

router.post('/uploadImages/:testID', isAuth(['teacher']), teacherController.sendImages);

router.get('/courses', isAuth(['teacher']), teacherController.courses);
router.get('/course/:courseID', isAuth(['teacher']), teacherController.course);
