import { conn } from "../db/mysqlconn.mjs";

export async function getStudentList(studentID){
    const [courses] = await conn.execute(
        "select c.course_id, c.course_name, i.image_object "+
        "from courses c join classes_and_courses cl "+
        "on c.course_id = cl.course_id "+
        "join images i on i.image_id = c.image_id where cl.class_id = "+
        "(select class_id from users where user_id = ?) order by c.course_name;", [studentID]
    );
    return courses;
}

export async function getByID(courseID){
    const [course] = await conn.execute(
        "select course_name from courses where course_id = ? ", [courseID]
    );
    return course[0].course_name;
}

export async function getTeacherList(teacherID){
    const [courses] = await conn.execute(
        "select c.course_id, c.course_name, i.image_object "+
        "from courses c join users u on c.teacher_id = u.user_id "+
        "join images i on i.image_id = c.image_id where c.teacher_id = ? order by c.course_name ", [teacherID]
    );
    return courses;
}