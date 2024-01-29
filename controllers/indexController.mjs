import { mainMenu } from "../helpers/menus.mjs";

export const home = async (req, res, next) => {
    res.render('index', {});
  }