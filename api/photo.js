const {dbStr} = require("./../config"); // 数据库地址
const mongoClient = require("mongodb").MongoClient;

var resultHandle = function (ctx, res) {
  let result = {
    status: true,
    message: "获取成功",
    data: null
  };
  result.data = res;
  ctx.response.type = "application/json";
  ctx.response.body = result;
  console.log("get成功");
}

// 提取数据接口
var photo = (ctx, next) => {
  let {
    orderBy,
    page
  } = ctx.request.query;

  console.log("api-photo-query: ", ctx.request.query);

  let promise = null;
  switch (orderBy) {
    case "latest":
      promise = new Promise((resolve, reject) => {
        mongoClient.connect(dbStr, (err, db) => {
          if (err) {
            console.error("连接mongo错误：", err);
            ctx.response.status = 500;
            return resolve(next());
          }
          let collection = db.collection("list"); // 连接到表list
          collection.find()
            .sort({
              index: -1
            })
            .skip(30 * (page - 1))
            .limit(30)
            .toArray((err, res) => {
              db.close(true);
              if (err) {
                console.error("get错误：", err);
                ctx.response.status = 500;
                return resolve(next());
              }
              resultHandle(ctx, res);
              resolve(next());
            })
        });
      });
      break;
    case "popular":
      promise = new Promise((resolve, reject) => {
        mongoClient.connect(dbStr, (err, db) => {
          if (err) {
            console.error("连接mongo错误：", err);
            ctx.response.status = 500;
            return resolve(next());
          }
          let collection = db.collection("list"); // 连接到表list
          collection.find()
            .sort({
              likes: -1
            })
            .skip(30 * (page - 1))
            .limit(30)
            .toArray((err, res) => {
              db.close(true);
              if (err) {
                console.error("get错误：", err);
                ctx.response.status = 500;
                return resolve(next());
              }
              resultHandle(ctx, res);
              resolve(next());
            })
        });
      });
      break;
    case "random":
      promise = new Promise((resolve, reject) => {
        mongoClient.connect(dbStr, async (err, db) => {
          if (err) {
            console.error("连接mongo错误：", err);
            ctx.response.status = 500;
            return resolve(next());
          }
          let collection = db.collection("list"); // 连接到表list
          let count = await collection.find().count();
          let findPromises = new Array(30).fill(null).map(item => ({
            index: {
              $gte: count * Math.random()
            }
          })).map(item => collection.findOne(item));
          let findResults = await Promise.all(findPromises).catch(err => {
            console.error("get错误：", err);
            ctx.response.status = 500;
            db.close(true);
            return resolve(next());
          });
          db.close(true);
          if (findResults) {
            resultHandle(ctx, findResults);
            resolve(next());
          }
        });
      });
      break;

      // "latest"
    default:
      next();
      break;
  }
  return promise;
}

module.exports = {
  "GET /photo/": photo
};