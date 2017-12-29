const Koa = require("koa");
// const bodyParser = require("koa-bodyparser");
const controller = require("./controller"); // 导入controller中间件
// const templating = require("./templating"); // 导入模板中间件
const fetching = require("./data_fetching/getPhoto");
const { port } = require("./config");

const isProduction = process.env.NODE_ENV === "production"; // 判断是否是生产环境
const app = new Koa();

app.use(async(ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`); // 打印URL
  await next(); // 调用下一个middleware
});

// 在生产环境下，静态文件是由部署在最前面的反向代理服务器（如Nginx）处理的，Node程序不需要处理静态文件。而在开发环境下，我们希望koa能顺带处理静态文件，否则，就必须手动配置一个反向代理服务器，这样会导致开发环境非常复杂。
if (! isProduction) {
  let staticFiles = require('./static-files'); // 导入处理静态文件的中间件
  app.use(staticFiles('/static/', __dirname + '/static'));
}

// 添加解析request的body的middleware
// bodyparser必须在router之前被注册到app上
// app.use(bodyParser());

// 使用模板中间件
/* app.use(templating("views", {
  noCache: !isProduction,
  watch: !isProduction
})) */

// 使用middleware
app.use(controller("./api"));

app.listen(port);
console.log(`app started at port ${port}...`);

// 服务运行之后开始定时获取数据
fetching();