import express from 'express';
import * as teacherController from '../controllers/teacherController.mjs';
import { isAuth } from '../controllers/userController.mjs';

export const router = express.Router();

router.get('/results', isAuth(['teacher']), teacherController.results);
router.get('/classes', isAuth(['teacher']), teacherController.classes);
router.get('/students/:classID', isAuth(['teacher']), teacherController.studentsByClass);
router.get('/student/:studentID', isAuth(['teacher']), teacherController.studentByID);


