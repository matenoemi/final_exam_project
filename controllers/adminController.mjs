import * as classModel from "../models/class.mjs"
import * as xlsx from 'node-xlsx';

import { readFile } from "fs/promises";
import { join } from 'path';
import { TEMPDIR } from '../appdirs.mjs';

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

    const tempName = join(TEMPDIR,list.filename); 
    const workbook = await readFile(tempName);
    const file = xlsx.parse(workbook);
    const rows = file[0].data;
    for(let i=0; i<rows.length; i++){
        for(let j=0; j<rows[i].length; j++){
            console.log(rows[i][j]);
        }
    }
    
}