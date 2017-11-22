const https = require("https");
const mongoClient = require("mongodb").MongoClient;

const dbStr = "mongodb://localhost:27017/moji"; // 数据库地址
const client_id = "70dbc6085bb2c444593e06cd567ac9476f8fb79528f8f0eed7f16d3c4f82a3fb"; // moji的client_id
const urls = {
  photo: "https://api.unsplash.com/photos",
  random: "https://api.unsplash.com/photos/random"
};

// 从UNsplash获取数据
function fetchData() {
  let timer = -1;
  timer = setInterval(() => {
    

  }, 60 * 60 * 1000);

  // 按最旧获取: 先查看数据库中按当前page_size有多少页,然后去fetch下一页。这样可以不用记录请求的页码了。
  function getPhotoByOldest() {
    https.get(urls.photo, res => {
      if (res.statusCode === 200) {
        let rawData = "";
        res.on("data", d => {
          rawData += d;
        });
        res.on("end", () => {
          try {
            let parsedData = JSON.parse(rawData);
            saveNewList(parsedData);
          } catch (error) {
            console.error(error);
          }
        });
      } else if (res.statusCode === 403) {
        // 请求次数达到限制
        clearInterval(timer);
        timer = -1;
      }
    }).on("error", e => console.error(e));
  }
}

// 保存数据到mongodb
function saveNewList(data) {
  mongoClient.connect(dbStr, (err, db) => {
    if (err) {
      console.error("fetch错误", err);
      return;
    }
    console.log("fetch成功");
    let collection = db.collection("list"); // 连接到表list
    collection.insertMany(data, (err, res) => {
      if (err) {
        console.error("insert错误：", err);
        return;
      }
      console.log("insert成功");
      db.close();
    })
  });
}

// 提取数据接口
function getNewList() {
  return new Promise((resolve, reject) => {
    mongoClient.connect(dbStr, (err, db) => {
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
    });
  });
}

module.exports = {
  fetchData,
  getNewList
};