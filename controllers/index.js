
var fn_photos = async (ctx, next) => {
  let getNewList = require("./../data_fetching/photo").getNewList;
  let list = await getNewList();
  console.log("list.length: ",list.length);
  ctx.response.body = list;
  ctx.response.type = "application/json";
  await next();
}

var fn_photos_random = async (ctx, next) => {
  await next();
}

module.exports = {
  "GET /photos": fn_photos,
  "GET /photos/random": fn_photos_random,
};