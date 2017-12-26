const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const mongoClient = require("mongodb").MongoClient;
// 提取数据接口
var photo = (ctx, next) => {
  return new Promise((resolve, reject) => {
    mongoClient.connect(dbStr, (err, db) => {
      if (err) {
        console.error(err);
        return false;
      }
      let {
        lastIndex,
        page
      } = ctx.request.query;
      let collection = db.collection("list"); // 连接到表list
      collection.find({
          index: {
            $lt: lastIndex - 30 * (page - 1)
          }
        })
        .limit(30)
        .sort({
          index: -1
        })
        .toArray((err, res) => {
          if (err) {
            console.error("get错误：", err);
            ctx.response.status = 500;
          }
          ctx.response.type = "application/json";
          ctx.response.body = res;
          console.log("get成功");
          db.close(true);
          resolve(next());
        })
    });
  });
}

module.exports = {
  "GET /photo/": photo
};