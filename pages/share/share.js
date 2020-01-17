/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
share.js 分享页面逻辑 100%
*********************************************************************/

var app = getApp(); //调用全局变量

Page({
  data: {},
  sharePoster:function(){
    //生成海报 使用微信图片预览功能
    let time = parseInt(new Date().getTime() / 1000);
    let imgSrc = 'http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/poster-img.jpg?'+time;
    wx.previewImage({
      current: imgSrc, // 当前显示图片的http链接
      urls: [imgSrc] // 需要预览的图片http链接列表
    })
  },
  onShareAppMessage: function() {
        //微信自带分享分享
      let time = parseInt(new Date().getTime() / 1000);
        return {
            title: "专业资产配置服务品牌",
            path: "/pages/home/home",
            imageUrl: "http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/share-img.png?"+time
        };
    }
})

