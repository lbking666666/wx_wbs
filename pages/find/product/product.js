// create time 2018/12/04
// describe: 用于‘增值服务’ & ‘高端专享’ 详情页面的模块

var app = getApp(); //调用全局变量
var WxParse = require('../../../wxParse/wxParse.js');
let libs = require("../../../utils/util.js"); //调用方法
Page({
    data: {
        productTitles: ['增值服务', '高端尊享'],
        imgLsit: [], // banner image url
        xBean: 0, // 鑫积分
        integral: 0, // 积分
        title: '', // 标题
        stitle: '', // 副标题
        include: '', // 服务范围
        panter: '', // 合作伙伴
        giftDetail: '', // 礼遇详情
        fileName: '',
        pdfUrl: '',
        swiperIndex: 1 // swiper 的 index
    },
    onLoad: function(options){
        wx.setNavigationBarTitle({
            title: this.data.productTitles[options.type - 1] //修改页面标题
        })
        this.getData(options.id)
    },
    onShow: function(){},
    onHide: function(){},
    getData: function(id){
        let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipPrivileges/' + id
        let self = this
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //发送请求
        wx.request({
            url: url,
            method: "GET",
            success: function(res) {
                if (res.data.meta.success) {
                    self.setData({
                        imgLsit: res.data.data.listUrl,
                        integral: res.data.data.integral || 0,
                        xBean: res.data.data.xdIntegral || 0,
                        title: res.data.data.privilegeName,
                        stitle: res.data.data.userLevel,
                        include: res.data.data.serviceScop,
                        panter: res.data.data.partner,
                        giftDetail: res.data.data.content,
                        pdfUrl: res.data.data.pdfUrl,
                        fileName: res.data.data.fileName
                    })
                    WxParse.wxParse('newsContent', 'html', res.data.data.content, self, 5);
                } else {
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(res.data.meta.message)
                }
                //关闭加载中
                setTimeout(function() {
                    wx.hideLoading();
                }, 200)
            },
            fail: function(e) {
                //关闭加载中
                setTimeout(function() {
                    wx.hideLoading();
                }, 200)
                wx.showToast({
                    title: '请检查手机网络',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    openPdf: function(e){
      let url = e.currentTarget.dataset.url.toString()
      let aliUrl = 'https://xm-file.oss-cn-beijing.aliyuncs.com/'
      let downUrl = 'https://xmfile.xmrxcaifu.com/'
      if (url.indexOf(aliUrl) != -1) {
        url = url.replace(aliUrl, downUrl)
      }

      wx.downloadFile({
        url: url,
          success: function(res) {
              var filePath = res.tempFilePath;
              console.log(filePath);
              wx.openDocument({
                  filePath: filePath,
                  success: function(res) {
                      //关闭加载中
                      wx.hideLoading();
                      console.log(res);
                      console.log('打开文档成功')
                  }
              })
          }
      })
    },
    // 咨询预约
    takeAsk: function(){
        // wx.makePhoneCall({
        //     phoneNumber: '4006033066'
        // })
        wx.showModal({
            content: '4006-033-066',
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.makePhoneCall({
                        phoneNumber: '4006-033-066'
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
  onShareAppMessage: function () {
    let time = parseInt(new Date().getTime() / 1000);
    //微信自带分享分享
    return {
      title: "专业资产配置服务品牌",
      path: "/pages/home/home",
      imageUrl: "http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/share-img.png?" + time
    };
  },
    // 获取swiper 的index
    getSwiperIndex: function(e){
        this.setData({
            swiperIndex: e.detail.current + 1
        })
    }
})