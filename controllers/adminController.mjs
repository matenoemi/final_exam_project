import * as classModel from "../models/class.mjs"
import * as studentModel from "../models/student.mjs";
import * as teacherModel from "../models/teacher.mjs";

export async function classes(req, res, next){
    const classes = await classModel.getList();
    res.render('classes', {classes});
}

export async function newClass(req, res, next){
    res.render('newClass');
}

export async function addNewClass(req, res, next){
    const list = req.file;
    const name = req.body.name;
    const password = req.body.password;
    const grade = req.body.grade;
    const classID = await classModel.addNew(list, name, password, grade);
    const path = '/admin/students/'+classID;
    res.redirect(path);
}

export async function students(req, res, next){
    const students = await studentModel.getListByClass(req.params.classID);
    const className = await classModel.getNameByID(req.params.classID);
    res.render('students', {students, classID: req.params.classID, className});
}

export async function student(req, res, next){
    const student = await studentModel.getByID(req.params.studentID);
    res.render('student', {student});
}

export async function teachers(req, res, next){
    const teachers = await teacherModel.getList();
    res.render('teachers', {teachers});
}

export async function newTeacher(req, res, next){
    res.render('newTeacher');
}

export async function addNewTeacher(req, res, next){
    const name = req.body.name;
    const password = req.body.password;
    const result = await teacherModel.addNew(name, password);
    res.redirect('/admin/teachers');
}

export async function newStudent(req, res, next){
    const classID = req.params.classID;
    const className = await classModel.getNameByID(classID);
    res.render('newStudent', {classID, className});
}

export async function addNewStudent(req, res, next){
    const classID = req.params.classID;
    const name = req.body.name;
    const password = req.body.password;
    const result = await studentModel.addNew(name, password, classID);
    const path = '/admin/students/'+classID;
    res.redirect(path);
}