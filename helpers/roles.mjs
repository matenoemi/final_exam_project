import { conn } from "../db/mysqlconn.mjs";

let rolesList = null;

// values in role column
export async function refreshRoles(){
  const [rows, fields] = await conn.execute(
    `SELECT SUBSTRING(COLUMN_TYPE,5) as rolelist
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA='learn_info' 
    AND TABLE_NAME='users'
    AND COLUMN_NAME='user_role'`);

  const list = rows[0].rolelist; 
  const roles = list.match(/[a-z]+/g); 

  rolesList = roles;  
}

refreshRoles();

export function getRoles() {
  return rolesList;
}