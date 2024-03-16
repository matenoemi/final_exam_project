import express from 'express';
import * as adminController from '../controllers/adminController.mjs';
import { isAuth } from '../controllers/userController.mjs';

import multer from 'multer';
import { TEMPDIR } from '../appdirs.mjs';
const mUploads = multer({ dest: TEMPDIR });

export const router = express.Router();

router.get('/classes', isAuth(['admin']), adminController.classes);
router.get('/newClass', isAuth(['admin']), adminController.newClass);
router.post('/newClass', isAuth(['admin']), mUploads.single('list'), adminController.addNewClass);
router.get('/students/:classID', isAuth(['admin']), adminController.students);
router.get('/student/:studentID', isAuth(['admin']), adminController.student);

router.get('/teachers', isAuth(['admin']), adminController.teachers);
router.get('/newTeacher', isAuth(['admin']), adminController.newTeacher);
router.post('/newTeacher', isAuth(['admin']), adminController.addNewTeacher);

router.get('/newStudent/:classID', isAuth(['admin']), adminController.newStudent);
router.post('/newStudent/:classID', isAuth(['admin']), adminController.addNewStudent);