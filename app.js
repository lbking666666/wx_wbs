/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
app.js 
*********************************************************************/
var libs = require("./utils/util.js"); //调用公共方法
const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
App({
  onLaunch: function() {
    // 查看是否授权
    libs.loginAuto();
  },
  globalData: {
    userInfo: null,
    apiUrl: libs.baseUrl, //测试环境
    header: {}, //图形验证码cookie
    gCurrentTab: 0, //发现页面tab
    meShow: false, //我的页面是否可见
    gCurrentChildTab: 0, //发现页面资讯下面tab
    returnHome: false, //我的页面是否返回首页
    reloadMe: true //我的页面是否刷新
  }
});
