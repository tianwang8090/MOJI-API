const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const mongoClient = require("mongodb").MongoClient;
// 提取数据接口
function photo(ctx, next) {
  mongoClient.connect(dbStr, async (err, db) => {
    if (err) {
      console.error(err);
      return;
    }
    let collection = await db.collection("list"); // 连接到表list
    collection.find({}).skip(0).limit(10).toArray((err, res) => {
      if (err) {
        console.error("get错误：", err);
        return;
      }
      console.log("get成功");
      db.close();
      ctx.response.body = res;
      ctx.response.type = "application/json";
      await next();
    })
  });
}

module.exports = {
  "GET /photo/": photo
};