const defaultMenu = {
  Home : '/',
  Bits: '/learn/bits'
};

const adminMenu = {
  Home : '/',
  Teachers: '/admin/teachers',
  Classes: '/admin/classes'
};

const studentMenu = {
  Home : '/learn/courses',
  Chapters: '/learn/chapters',
  Sort : '/learn/sort',
  Bits: '/learn/bits'
};

const teacherMenu = {
  Home : '/teacher/courses',
  Results: '/teacher/results',
  Classes: '/teacher/classes',
  Chapters: '/teacher/chapters'
};

export function mainMenu(user){
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