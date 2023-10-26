import { mainMenu } from "../helpers/menus.mjs";


export async function sort(req, res, next) {
  res.render("sort", {
    menu: mainMenu,
  });
  }