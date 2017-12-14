const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const mongoClient = require("mongodb").MongoClient;
// 提取数据接口
async function photo(ctx, next) {
  /* mongoClient.connect(dbStr, (err, db) => {
    if (err) {
      console.error(err);
      return reject(err);
    }
    let collection = db.collection("list"); // 连接到表list
    collection.find().toArray((err, res) => {
      if (err) {
        console.error("get错误：", err);
        return reject(err);
      }
      console.log("get成功");
      db.close();
      return resolve(res);
    })
  }); */
}

module.exports = {
  "GET /photo/": photo
};