import { conn } from "../db/mysqlconn.mjs";

export async function getListByCourseID(courseID){
    const [classes] = await conn.execute(
        "select cl.class_id, cl.class_name, cl.class_grade from classes cl "+
        "join classes_and_courses clco on cl.class_id = clco.class_id "+
        "where clco.course_id = ?;", [courseID]
    );
    return classes;
}

export async function getListToCourse(courseID){
    const [classes] = await conn.execute(
    "select class_id, class_name, class_grade from classes where class_id not in "+
    "(select cl.class_id from classes cl "+
        "join classes_and_courses clco on cl.class_id = clco.class_id "+
        "where clco.course_id = ? )", [courseID]
    );
    return classes;
}

export async function getList(){
    const [classes] = await conn.execute(
        "select * from classes order by class_grade"
    );
    return classes;
}