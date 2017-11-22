const nunjucks = require("nunjucks");

function createEnv(path, opts) {
  var autoescape = opts.autoescape ? opts.autoescape : true,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false,
    env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(path || "views", {
        noCache: noCache,
        watch: watch
      }), {
        autoescape: autoescape,
        throwOnUndefined: throwOnUndefined
      }
    );

  if (opts.filters) {
    for (var f in opts.filters) {
      if (opts.filters.hasOwnProperty(f)) {
        env.addFilter(f, opts.filters[f]);
      }
    }
  }

  return env
}

function templating(path, opts) {
  // 创建nunjucks的env对象
  var env = createEnv(path, opts);
  return async(ctx, next) => {
    // 给ctx绑定render函数：
    ctx.render = function (view, model) {
      // 把render后的内容赋值给res.body
      /* 
        model || {}确保了即使传入undefined，model也会变为默认值{}。Object.assign()会把除第一个参数外的其他参数的所有属性复制到第一个参数中。第二个参数是ctx.state || {}，这个目的是为了能把一些公共的变量放入ctx.state并传给View。
        app.use(async (ctx, next) => {
          var user = tryGetUserFromCookie(ctx.request);
          if (user) {
              ctx.state.user = user;
              await next();
          } else {
              ctx.response.status = 403;
          }
      });
      */
      ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
      // 设置content-type
      ctx.response.type = "text/html";
    }
    await next();
  }
}

module.exports = templating;