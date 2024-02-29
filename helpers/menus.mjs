const defaultMenu = {
  Home : '/',
  Bits: '/learn/bits'
};

const studentMenu = {
  Home : '/',
  Chapters: '/learn/chapters',
  Sort : '/learn/sort',
  Bits: '/learn/bits'
};

const teacherMenu = {
  Home : '/',
  Results: '/teacher/results',
  Classes: '/teacher/classes',
  Exercises: '/teacher/exercises'

};

export function mainMenu(user){
  console.log("MENU MEGHIVVA");
  console.log("User:"+user);
    if(!user){
      return defaultMenu;
    }else{
      switch (user.user_role){
        case 'student': return studentMenu;
        case 'teacher': return teacherMenu;
        default: return defaultMenu;  
      }
    }
}
