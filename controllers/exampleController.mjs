import { mainMenu } from "../helpers/menus.mjs";
import {conn} from "../db/mysqlconn.mjs"

export async function sort(req, res, next) {
    res.render('sort', {
      menu: mainMenu,
    });
}

  
export async function playWithBits(req,res,next){
    console.log("Bitsben");
    console.log(req.session.user);
    const imageID = 18;
    const [image] = await conn.execute(
      "select image_object from images where image_id = ?",[imageID]
    )
    res.render('bits',{image: image[0]});
}
  
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

export async function compiler(req, res, next){
  console.log('req'+req);
  res.render('compiler',{message:"Hello"});
}