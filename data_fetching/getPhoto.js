const https = require("https");
const mongoClient = require("mongodb").MongoClient;

const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const client_id = "cfe37fef16e74af3351242987c5871adf3bc6121a8efbab341b5f41382176ea4"; // moji的client_id
const urls = {
  photo: "https://api.unsplash.com/photos",
  random: "https://api.unsplash.com/photos/random"
};

// 连接mongodb
function connectMongo(url, callback) {
  mongoClient.connect(url, (err, db) => {
    if (err) {
      console.error("连接mongodb错误：", err);
      callback(null);
      return;
    }
    console.log("连接mongodb成功！");
    callback(db);
  })
}
// 断开mongodb
function disconnectMongo(db) {
  if (db) {
    db.close(true);
    console.log("断开mongodb成功！");
  }
}

// 查询mongo中所有图片记录页数
async function calculatePageCount(db, collection, pageSize) {
  let count = await db.collection(collection).count(); // 连接到表，获取记录条数
  return Math.ceil(count / pageSize);
}

// 从unsplash获取数据,按最旧获取
function getPhotoByOldest() {
  connectMongo(dbStr, async db => {
    if (db) {
      let pages = await calculatePageCount(db, "list", 30);
      // 递归循环请求
      (function get(index) {
        let url = `${urls.photo}?page=${pages+index+1}&per_page=30&order_by=oldest&client_id=${client_id}`;
        console.log(`第${index + 1}次请求，page: ${pages+index+1}...`);
        https.get(url, res => {
          console.log(`第${index + 1}次请求返回...`);
          if (res.statusCode === 200) {
            let rawData = "";
            res.on("data", d => {
              rawData += d;
            });
            res.on("end", async () => {
              let parsedData = JSON.parse(rawData);
              parsedData.forEach((_element, _index) => {
                _element.index = (pages + index) * 30 + _index;
              });
              await savePhotos(db, "list" ,parsedData);
              // 请求ok、继续下一次请求
              get(index + 1);
            });
          } else if (res.statusCode === 403) {
            // 请求次数达到限制被屏蔽,不再请求
            console.log("请求次数达到限制...");
            disconnectMongo(db);
          } else {
            console.log(`其他返回状态：${res.statusCode}，url: ${url}`);
            // 其他状态，5s后重试
            setTimeout(() => {
              get(index);
            }, 5000);
          }
        }).on("error", e => {
          console.error(`第${index + 1}次请求错误：`, e);
          disconnectMongo(db);
        });
      })(0)
    }
  })
}

// 保存数据到mongodb
function savePhotos(db, collection, data) {
    return new Promise((resolve, reject) => {
      let col = db.collection(collection); // 连接到表list
      col.insertMany(data, (err, res) => {
        if (err) {
          console.error("保存数据错误：", err);
          reject();
        }
        console.log("保存数据成功！");
        resolve();
      })
    });
}

module.exports = function () {
  // 每隔50min获取数据
  console.log("starting fetching...");
  getPhotoByOldest();
  setInterval(getPhotoByOldest, 50*60*1000);
}