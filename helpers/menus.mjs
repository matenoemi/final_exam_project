const defaultMenu = {
  Home : '/',
  Bits: '/learn/bits',
  Compiler: '/learn/compiler'
};

const adminMenu = {
  Főoldal : '/',
  Tanárok : '/admin/teachers',
  Osztályok : '/admin/classes'
};

const studentMenu = {
  Főoldal : '/learn/courses',
  Fejezetek: '/learn/chapters',
  //Sort : '/learn/sort',
  //Bits: '/learn/bits',
  //Sounds: '/learn/sounds'
};

const teacherMenu = {
  Főoldal : '/teacher/courses',
  //Results: '/teacher/results',
  Osztályok: '/teacher/classes',
  Fejezetek: '/teacher/chapters'
};

export function mainMenu(user, course){
    if(!user){
      return defaultMenu;
    }else{
      switch (user.user_role){
        case 'student': return studentMenu;
        case 'teacher': return teacherMenu;
        case 'admin': return adminMenu;
        default: return defaultMenu;  
      }
    }
}