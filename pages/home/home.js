/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
home.js 精选页面逻辑 
*********************************************************************/
let app = getApp(); //调用全局变量
let libs = require("../../utils/util.js"); //调用方法
Page({
    data: {
        pageNo: 1, //新闻列表请求第几页
        pageSize: 2, //新闻列表每页的请求数
        bannerData: [], //banner数据
        hotData: [], //财经早班车数据
        teachData: [], //投教讲堂数据
        bindManager: false, //是否绑定理财师
        showManagerTip: true, //是否显示绑定理财师tip
        bannerPullDown:false,//幻灯下拉刷新
        pullDown:false,//财经早班车下来刷新
        pullDown2:false,//财经早班车下来刷新
        xxhData: [], // 鑫享会数据
        pullDown3: false, //鑫享会下拉刷新
        levelStr: {
            platinum: '铂金卡',
            gold: '金卡',
            silver: '银卡',
            register: '普卡'
        }
    },
    onLoad: function() {
      let that = this
      setTimeout(function(){
        that.setData({
          showManagerTip: false
        })
      }, 3000)
        /* 加载 banner数据 */
      that.getBanerData()
        /* 加载 财经早班车 数据 */
      that.getNewsData('financialEarlyTrain', that.data.pageNo, that.data.pageSize); /* 加载 投教讲堂 数据 */
      that.getNewsData('forTeaching', that.data.pageNo, that.data.pageSize);
      that.getXxhData() // 获取鑫享会数据
        // 查看是否授权
      libs.loginAuto().then(res=>{
        that.showManager()
      });
    },
    onShow: function() {
        /*
            切换页面时，如果本地存储了token,并且已经绑定理财师者不显示预约理财师按钮
        */
        let self = this;
        //初始进来时候 没有登录的 已经授权的 判断是否绑定理财师
        self.showManager()

    },
    onHide: function() {
        //我的页面点击不跳转到首页
        app.globalData.returnHome = false;
    },
    getBanerData: function(down) {
        /*获得banner数据*/
        let url = app.globalData.apiUrl + '/api/v1/choiceNess/queryRecommendWeChat';
        let self = this;
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
                    //接口返回成功 更新bannerData数据
                    self.setData({
                        bannerPullDown:true,
                        bannerData: res.data.data
                    })
                    /*  
                        参数down标识下拉刷新
                        关闭下拉刷新状态
                     */
                    if (down) {
                        setTimeout(function() {
                            //wx.hideNavigationBarLoading()
                            wx.stopPullDownRefresh();
                        }, 500)
                    }
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
    
    // 鑫享会数据
    getXxhData: function(down) {
        let url = app.globalData.apiUrl + '/api/v1/choiceNess/choiceNessInitSmall'
        let self = this;
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
                        pullDown3: true,
                        xxhData: res.data.data.privilegeCxxhType
                    })

                    //  参数down标识下拉刷新，关闭下拉刷新状态 
                    if (down) {
                        setTimeout(function() {
                            wx.stopPullDownRefresh();
                        }, 500)
                    }
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
    getNewsData: function(type, pageNo, pageSize, down) {
        /*获得新闻列表数据*/
        let url = app.globalData.apiUrl + '/api/v1/choiceNess/queryRecommendNewsWeCat/' + type + '/' + pageNo + '/' + pageSize;
        let self = this;
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
                    //请求成功
                    if (type == 'forTeaching') {
                        //请求type判断 如果为 forTeaching 更新teachData
                        self.setData({
                             pullDown2:true,
                             teachData: res.data.data.list
                        })
                    } else if (type == "financialEarlyTrain") {
                        //请求type判断 如果为 financialEarlyTrain 更新hotData
                        self.setData({
                            pullDown:true,
                            hotData: res.data.data.list
                        })
                    }
                    /*  
                        参数down标识下拉刷新
                        关闭下拉刷新状态
                     */
                    if (down) {
                        setTimeout(function() {
                            //wx.hideNavigationBarLoading()
                            wx.stopPullDownRefresh();
                        }, 500)
                    }
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
    tabSwith: function(e) {
        /*
            点击新闻栏目标题(财经早班车、投教讲堂)跳转到发现的资讯tab对应栏目
            根据点击的栏目的id 设置存储跳转id
        */
        console.log(e.currentTarget.dataset.type)
        wx.setStorageSync('gCurrentChildTab', e.currentTarget.dataset.id);
        if(e.currentTarget.dataset.type == 'xxh'){
            getApp().globalData.xxhTab = true
            // console.log('xxh')
        }else{
            getApp().globalData.xxhTab = false
        }
        wx.switchTab({ //跳转到tab页面方法
            url: '../find/find'
        })
    },
    showManager: function() {
        //是否显示预约理财师按钮
        let url = app.globalData.apiUrl + '/api/v1/service/validateOther';
        let self = this;
        if (wx.getStorageSync('token')) {
            libs.requestAuto(url).then(res => {
                if(res){
                     if (res.data.meta.success) {
                        //请求成功改变为已经绑定
                        self.setData({
                            bindManager: true
                        })
                    } else {
                        //请求失败改为未绑定
                        self.setData({
                            bindManager: false
                        })
                    }
                }
            });
        } else {
            //未登录改为未绑定
            self.setData({
                bindManager: false
            })
        }
    },
    toPage: function(e) {
        //跳转详情页
        let id = e.currentTarget.dataset.id
        let type = e.currentTarget.dataset.type
        let pagetype = e.currentTarget.dataset.pagetype
        if(type == 5 || type == 99){ // 5或99 都是鑫享会
            console.log('../find/product/product?id=' + id + '&type=' + pagetype)
            wx.navigateTo({
                url: '../find/product/product?id=' + id + '&type=' + pagetype
            })
        }else{
            wx.navigateTo({
                url: '../find/page/page?id=' + id + '&type=' + type
            })
        }
        
    },
    onPullDownRefresh: function() {
        // this.setData({
        //   bannerData: [],
        //   hotData: [], 
        //   teachData: []
        // })
        //页面下拉刷新
        this.setData({ 
            bannerPullDown: false,
            pullDown: false,
            pullDown2: false
        })
        //wx.showNavigationBarLoading()
        /* 加载 banner数据 */
        this.getBanerData('down');
        /* 加载 财经早班车 数据 */
        this.getNewsData('financialEarlyTrain', this.data.pageNo, this.data.pageSize, 'down');
        /* 加载 投教讲堂 数据 */
        this.getNewsData('forTeaching', this.data.pageNo, this.data.pageSize, 'down');
        /*  setTimeout(function() {
              wx.hideNavigationBarLoading()
              wx.stopPullDownRefresh();
          }, 2000)*/
        this.getXxhData('down') // 获取鑫享会数据
    },
    onShareAppMessage: function() {
      let time = parseInt(new Date().getTime() / 1000);
        //微信自带分享分享
        return {
            title: "专业资产配置服务品牌",
            path: "/pages/home/home",
          imageUrl: "http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/share-img.png?" + time
        };
    }
})