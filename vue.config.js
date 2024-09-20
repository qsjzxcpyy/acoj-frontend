const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack(config) {
    config.plugin("monaco").use(new MonacoWebpackPlugin());

    // 设置网页标签页标题
    config.plugin("html").tap((args) => {
      args[0].title = "acoj";
      return args;
    });
  },
});
