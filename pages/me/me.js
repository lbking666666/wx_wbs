/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
me.js 我的页面逻辑
*********************************************************************/
var app = getApp(); //调用全局变量
var libs = require("../../utils/util.js");
Page({
    data: {
        meData: {},
        totalMoney: 0, //总投资金额
        isFirst: false, //页面是否可见 未登陆不可见
        type: ["未认证投资者", "普通投资者", "专业投资者"],
        level: { '注册用户': 'normal', '普卡会员': 'normal', '银卡会员': 'silver', '金卡会员': 'gold', '铂金卡会员': 'platinum' },
        //userLevel: 'gold', //[normal, silver, gold, platinum]
        headUrl: '//xm-file.oss-cn-beijing.aliyuncs.com/cf/user-photo-1.png',
        // headUrl: '',
        isEyeOpen: true,
        down: false, //占位符
    },
    onLoad: function() {
        if (app.globalData.reloadMe) {
            //this.getData();
        }
    },
    onShow: function() {
        /*
            判断是否存在token
            存在:直接显示
            不存在:
                判断是否可以跳转到首页；
                否则跳转到登录页面；
        */
        if (!wx.getStorageSync('token')) {
            this.setData({
                isFirst: false
            })
            if (app.globalData.returnHome) {
                wx.switchTab({
                    url: '../home/home'
                })
            } else {
                    wx.navigateTo({
                        url: '../login/login'
                    })

            }
        } else {
            this.setData({
                isFirst: true
            })
            if (app.globalData.reloadMe) {
                this.getData();
            }
        }
    },

    toList: function(e) { // 进入列表页， type：产品类型
        let type = e.currentTarget.dataset.type
        wx.navigateTo({
            url: 'list/list?type=' + type
        })
    },
    getData: function() {
        /*获得我的页面数据*/
        let url = app.globalData.apiUrl + '/api/v1/mine/smartHome';
        let self = this;
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //发送请求
        libs.requestAuto(url).then(res => {
            if (res.data.meta.success) {
                let returnDate = res.data.data
                returnDate.nowTotalMoney = self.formatMoney(returnDate.nowTotalMoney, 2)
                if (returnDate.type == 0) {
                    returnDate.name = returnDate.name.substring(0, 3) + '****' + returnDate.name.substring(7, 11)
                }
                self.setData({
                    down: true,
                    meData: returnDate,
                    //headUrl:wx.getStorageSync('avatarUrl')
                })
                app.globalData.reloadMe = false;
            } else {
                wx.showToast({
                    title: res.data.meta.message,
                    icon: 'none',
                    duration: 2000
                })
                console.log(res.data.meta.message)
            }
            //关闭加载中
            setTimeout(function() {
                wx.stopPullDownRefresh();
                wx.hideLoading();
            }, 200)
        }, rej => {
            //关闭加载中
            setTimeout(function() {
                wx.hideLoading();
            }, 200)
            wx.showToast({
                title: '请检查手机网络',
                icon: 'none',
                duration: 2000
            })
        })
    },
    quit: function() { // 退出登录
        /*wx.setStorageSync('token', '')*/
        this.setData({
            isFirst: true
        })
        wx.navigateTo({
            url: '../login/login'
        })
    },
    showNoData: function() {
        wx.showToast({
            title: '暂无数据',
            icon: 'none',
            duration: 2000
        })
    },
    changeEye: function() {
        let newEye = !this.data.isEyeOpen
        this.setData({
            isEyeOpen: newEye
        })
    },
    toShare: function() {
        //跳转到分享页面
        wx.navigateTo({
            url: '../share/share'
        })
    },
    onPullDownRefresh: function() {
        this.setData({
            down: false
        })
        this.getData();
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
    formatMoney: function(money, decNum) {
        let moneyStr = libs.formatMoney(money, decNum)
        return moneyStr
    },
})