const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const mongoClient = require("mongodb").MongoClient;

function queryPhoto() {
  
}

// 提取数据接口
var photo = (ctx, next) => {
  let {
    orderBy,
    lastIndex,
    page
  } = ctx.request.query;

  if (!lastIndex || !page) {
    ctx.response.type = "application/json";
    ctx.response.body = {
      status: false,
      message: "查询参数错误",
      data: null
    }
    return resolve(next());
  }

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
              let result = {
                status: true,
                message: "获取成功",
                data: null
              };
              if (err) {
                console.error("get错误：", err);
                ctx.response.status = 500;
                return resolve(next());
              }
              result.data = res;
              ctx.response.type = "application/json";
              ctx.response.body = result;
              console.log("get成功");
              db.close(true);
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
              let result = {
                status: true,
                message: "获取成功",
                data: null
              };
              if (err) {
                console.error("get错误：", err);
                ctx.response.status = 500;
                return resolve(next());
              }
              result.data = res;
              ctx.response.type = "application/json";
              ctx.response.body = result;
              console.log("get成功");
              db.close(true);
              resolve(next());
            })
        });
      });
      break;
    case "random":
      promise = new Promise((resolve, reject) => {
        mongoClient.connect(dbStr, (err, db) => {
          if (err) {
            console.error("连接mongo错误：", err);
            ctx.response.status = 500;
            return resolve(next());
          }
          let collection = db.collection("list"); // 连接到表list
          let count = collection.find().count();
          let random = Math.random();
          let col = collection.find({
            index: {
              $gte: count * random
            }
          }).limit(30);
          if (col.count() < 30) {
            col = collection.find({
              index: {
                $lte: count * random
              }
            }).limit(30);
          }
          
          col.toArray((err, res) => {
            let result = {
              status: true,
              message: "获取成功",
              data: null
            };
            if (err) {
              console.error("get错误：", err);
              ctx.response.status = 500;
              return resolve(next());
            }
            result.data = res;
            ctx.response.type = "application/json";
            ctx.response.body = result;
            console.log("get成功");
            db.close(true);
            resolve(next());
          })
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