const fs = require("fs");

function addController(router, controllers_dir) {
  // 读取controllers里面的js文件
  var files = fs.readdirSync(__dirname + `/${controllers_dir}`);
  var js_files = files.filter(f => f.endsWith(".js"));
  for (var f of js_files) {
    let mapping = require(__dirname + `/${controllers_dir}/` + f);
    addMapping(router, mapping);
  }
}

function addMapping(router, mapping) {
  for (var url in mapping) {
    if (url.startsWith("GET ")) {
      var path = url.substring(4);
      router.get(path, mapping[url]);
    } else if (url.startsWith("POST ")) {
      var path = url.substring(5);
      router.post(path, mapping[url]);
    } else {
      console.log(`invalid URL: ${url}`);
    }
  }
}

module.exports = function (dir) {
  let controllers_dir = dir || "controllers", // 默认扫描controllers目录
    router = require("koa-router")();
  addController(router, controllers_dir);
  return router.routes();
};