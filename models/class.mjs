import { conn } from "../db/mysqlconn.mjs";
import * as studentModel from "../models/student.mjs";

import * as xlsx from 'node-xlsx';
import { readFile } from "fs/promises";
import { join } from 'path';
import { TEMPDIR } from '../appdirs.mjs';

export async function getListByCourseID(courseID){
    const [classes] = await conn.execute(
        "select cl.class_id, cl.class_name, cl.class_grade from classes cl "+
        "join classes_and_courses clco on cl.class_id = clco.class_id "+
        "where clco.course_id = ?;", [courseID]
    );
    return classes;
}

export async function getListToScheduleTest(courseID, testID){
    const [classes] = await conn.execute(
        "select cl.class_id, cl.class_name from classes cl "+
        "join classes_and_courses clco on cl.class_id = clco.class_id "+
        "where clco.course_id = ? and cl.class_id not in "+
        "(select class_id from scheduled_tests where test_id = ?)", [courseID, testID]
    );
    return classes;
}

export async function getListToCourse(courseID){
    const [classes] = await conn.execute(
    "select class_id, class_name, class_grade from classes where class_id not in "+
    "(select cl.class_id from classes cl "+
        "join classes_and_courses clco on cl.class_id = clco.class_id "+
        "where clco.course_id = ? ) order by class_grade", [courseID]
    );
    return classes;
}

export async function getList(){
    const [classes] = await conn.execute(
        "select * from classes order by class_grade"
    );
    return classes;
}

export async function addNew(list, name, password, grade){
    const [] = await conn.execute(
        "insert into classes(class_name, class_grade) values(?, ?)", [name, grade]
    );
    const [result] = await conn.execute(
        "select max(class_id) as classID from classes"
    );
    const classID = result[0].classID;

    const tempName = join(TEMPDIR,list.filename); 
    const workbook = await readFile(tempName);
    const file = xlsx.parse(workbook);
    const rows = file[0].data;
    for(let i=0; i<rows.length; i++){
        for(let j=0; j<rows[i].length; j++){
            const name = rows[i][j];
            console.log(name+" "+password+" "+classID);
            const result = await studentModel.addNew(name, password, classID);
        }
    }
    return classID;
}

export async function getNameByID(classID){
    const [result] = await conn.execute(
        "select class_name from classes where class_id = ?",[classID]
    );
    return result[0].class_name;
}