const defaultMenu = {
  Home : '/',
  Bits: '/learn/bits'
};

const studentMenu = {
  Home : '/',
  Chapters: '/learn/chapters',
  Sort : '/learn/sort',
  Bits: '/learn/bits',
  "Drag and drop": '/learn/draganddrop'
};

const teacherMenu = {
  Home : '/',
  Statistics: '/learn/statistics'
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
