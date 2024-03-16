import {conn} from "../db/mysqlconn.mjs";

export async function getList(limitValue){
    const [groups] = await conn.execute(
        "select * from groups order by group_id desc limit ?", [limitValue]
    );
    return groups;
}

export async function addNew(groupName){
    const [result] = await conn.execute(
        "insert into groups(group_name) values(?)", [groupName]
    );
    return result;
}

export async function addList(groups){
    const length = groups.length;
    for(let i=0; i<length; i++){
        const result = await addNew(groups[i]);
    }
    let list = await getList(length);
    list.sort((a, b) => {
        if (a.group_name < b.group_name) return -1;
        if (a.group_name > b.group_name) return 1;
        return 0;
    });
    return list;
}