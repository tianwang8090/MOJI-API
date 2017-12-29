const config = {
  port: 3000, // 服务监听端口
  dbStr: "mongodb://localhost:27017/moji", // 数据库地址
  client_id: "cfe37fef16e74af3351242987c5871adf3bc6121a8efbab341b5f41382176ea4", // moji的client_id
  urls: {
    photo: "https://api.unsplash.com/photos"
  }
}

module.exports = config;