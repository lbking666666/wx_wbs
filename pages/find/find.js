/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
find.js 发现页面逻辑 100%
*********************************************************************/
var app = getApp(); //调用全局变量
let libs = require("../../utils/util.js"); //调用方法
Page({
    data: {
        pageNo: 1, //页数
        pageSize: 10, //每页请求数
        hotData: [], //财经早班车数据
        teachData: [], //投教讲堂数据
        studyData: [], //海外留学数据
        purchaseData: [], //海外置业数据
        activeData: [], //活动数据
        tab: ["资讯", "服务", "鑫享会", "活动"], //顶部tab
        currentTab: 0, //顶部tab当前项
        consultTab: ["鑫茂财讯", "财商讲堂"], //内容tab
        currentChildTab: 0, //内容tab当前项
        returnTop: false, //返回顶部按钮,
        bindManager: false, //是否绑定理财师
        hotUp: true, //财经早班车上拉加载更多
        hotUpData:[],
        hotPullDown:false,//财经早班车下拉占位符
        teachUp:true,//财经讲堂上拉加载更多
        teachUpData:[],
        teachPullDown:false,//财经讲堂下拉占位符
        activeUp:true,//活动上拉加载更多
        activeUpData:[],
        activePullDown:false,//活动下拉占位符
        product1PullDown:false,//海外置业下拉占位符
        product2PullDown:false,//海外留学下拉占位符
        valaddServiceData: [], //鑫享会--增值服务列表
        exclusiveData: [], //鑫享会--高端专享列表
        levelStr: {
            platinum: '铂金卡',
            gold: '金卡',
            silver: '银卡',
            register: '普卡'
        }
    },
    onLoad: function(options) {
        /* 加载 财经早班车 数据 */
        this.getNewsData('financialEarlyTrain', 1, this.data.pageSize);
        /* 加载 投教讲堂 数据 */
        this.getNewsData('forTeaching', 1, this.data.pageSize);

        /* 加载 海外置业 数据 */
        this.getProductData(4, 1, 3);
        /* 加载 海外留学 数据 */
        this.getProductData(5, 1, 3);
        /* 加载 活动 数据 */
        this.getActiveData(1, this.data.pageSize);

        // 加载鑫享会数据
        this.valueAddedService()
        this.getExclusiveData()
    },
    onShow: function() {
        /*显示页面时，
          根据全局变量设置来对应tab当前项
          如果从底部点击进来 则都为默认项即第一项
          如果从首页或其他页面进入是需要取全局变量来获取当前项
        */
        if(wx.getStorageSync('gCurrentChildTab')){
            this.setData({//修改页面当前项
                currentTab: 0,
                currentChildTab: wx.getStorageSync('gCurrentChildTab'),
               })
        }
        if(app.globalData.xxhTab == true){
            this.setData({  
                currentTab: 2,
                currentChildTab: 0
            }) 
            // globalData.xxhTab 需销毁，避免影响tab点击传参
            app.globalData.xxhTab = null
            console.log('type='+  app.globalData.xxhTab  )
        }
        console.log(this.data.gCurrentTab)
        /* 
        var gTab = app.globalData.gCurrentTab;//顶部tab当前项
        var  gChildTab = app.globalData.gCurrentChildTab//内容tab当前项
        this.setData({//修改页面当前项
            currentTab: gTab,
            currentChildTab: gChildTab
        })
        */
        /*
            切换页面时，如果本地存储了token,并且已经绑定理财师者不显示预约理财师按钮
         */
        this.showManager()
    },
    onHide: function() {
        /*页面隐藏时，
          还原全局变量tab当前项，
          作用：当正常点击底部tab进来是为默认项即第一项
        */
        wx.setStorageSync('gCurrentChildTab', '');
        /*app.globalData.gCurrentTab = 0;
        app.globalData.gCurrentChildTab =0;*/
        //我的页面点击不跳转到首页
        app.globalData.returnHome = false;
    },
    topTab: function(e) { //顶部tab点击事件，更新顶部tab当前项的值
        this.setData({
            pageNo: 1, //初始页面请求页数
            up: true, //开启上拉
            currentTab: e.currentTarget.dataset.idx
        })
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        })
    },
    consultTab: function(e) { // 咨询--tab点击事件，更新内容tab当前项的值
        this.setData({
            pageNo: 1, //初始页面请求页数
            up: true, //开启上拉
            currentChildTab: e.currentTarget.dataset.idx
        })
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
        })
        console.log(this.data.currentChildTab)
    },
    getNewsData: function(type, pageNo, pageSize, down) { /*获得新闻列表数据*/
        let url = app.globalData.apiUrl + '/api/v1/aboutUs/queryNewsByTypeWeCat/' + type + '/' + pageNo + '/' + pageSize;
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

                        //没有数据则不可上拉
                        if (res.data.data.hasNextPage == false) {
                            self.setData({
                                teachUp: false,
                                teachUpData:[]
                            })
                        }
                        //判断是否请求第一页数据
                        if (pageNo == 1) {
                            self.setData({
                                teachPullDown:true,
                                teachData: res.data.data.list
                            })
                        } else {
                            //上拉加载更多
                            let len = self.data.teachData.length-1;
                            let month = self.data.teachData[len].releaseMonth;
                            let nextMonth = res.data.data.list[0].releaseMonth;
                            if(month == nextMonth){//合并月份
                                let listArr = self.data.teachData;
                                let monthArr = self.data.teachData[len].newsVOList.concat(res.data.data.list[0].newsVOList)
                                listArr[len].newsVOList = monthArr;
                                listArr.concat(res.data.data.list.shift())
                                self.setData({
                                    teachUpData:[],
                                    teachData: listArr
                                })
                            }else{
                                self.setData({
                                    teachUpData:[],
                                    teachData: self.data.teachData.concat(res.data.data.list)
                                })
                            }

                        }

                    } else if (type == "financialEarlyTrain") {
                        //请求type判断 如果为 financialEarlyTrain 更新hotData

                        //没有数据则不可上拉
                        if (res.data.data.hasNextPage == false) {
                            self.setData({
                                hotUp: false,
                                hotUpData:[],
                            })
                        }
                        //判断是否请求第一页数据
                        if (pageNo == 1) {
                            self.setData({
                                hotPullDown:true,
                                hotData: res.data.data.list
                            })
                        } else {
                            //上拉加载更多
                            /*self.setData({
                                hotData: self.data.hotData.concat(res.data.data.list)
                            })*/
                            //上拉加载更多
                            let len = self.data.hotData.length-1;
                            let month = self.data.hotData[len].releaseMonth;
                            let nextMonth = res.data.data.list[0].releaseMonth;
                            if(month == nextMonth){//合并月份
                                let listArr = self.data.hotData;
                                let monthArr = self.data.hotData[len].newsVOList.concat(res.data.data.list[0].newsVOList)
                                listArr[len].newsVOList = monthArr;
                                listArr.concat(res.data.data.list.shift())
                                
                               self.setData({
                                    hotUpData:[],
                                    hotData: listArr
                                }) 
                              
                                
                            }else{
                               
                               self.setData({
                                    hotUpData:[],
                                    hotData: self.data.hotData.concat(res.data.data.list)
                                }) 
                                
                            }
                        }
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
    valueAddedService: function (down) {
      /* 获取鑫享会--增值服务列表数据 */
      let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipPrivilegesHome';
      let self = this;
      //显示加载中
      wx.showLoading({
        title: '加载中',
      });
      //发送请求
      wx.request({
        url: url,
        method: "GET",
        success: function (res) {
          if (res.data.meta.success) {
            //请求成功
            self.setData({
              valaddServiceData: res.data.data
            })
           
            /* 参数down标识下拉刷新 关闭下拉刷新状态 */
            if (down) {
              setTimeout(function () {
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
          }
          //关闭加载中
          setTimeout(function () {
            wx.hideLoading();
          }, 200)
        },
        fail: function (e) {
          //关闭加载中
          setTimeout(function () {
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
    getExclusiveData: function (down) {
        /* 获取鑫享会--高端专享列表数据 */
        let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipPrivilegesHomeHigh';
        let self = this;
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //发送请求
        wx.request({
            url: url,
            method: "GET",
            success: function (res) {
                if (res.data.meta.success) {
                //请求成功
                self.setData({
                    exclusiveData: res.data.data
                })
                
                /* 参数down标识下拉刷新 关闭下拉刷新状态 */
                if (down) {
                    setTimeout(function () {
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
                }
                //关闭加载中
                setTimeout(function () {
                    wx.hideLoading();
                }, 200)
            },
            fail: function (e) {
                //关闭加载中
                setTimeout(function () {
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
    getProductData: function(type, pageNo, pageSize, down) {
        /*获得产品列表数据*/
        let url = app.globalData.apiUrl + '/api/v1/service/getProductInfoListWeCat/' + type + '/' + pageNo + '/' + pageSize;
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
                    if (type == 4) {
                        //请求type判断 如果为 4 更新海外置业
                        self.setData({
                            product1PullDown:true,
                            purchaseData: res.data.data.list
                        })
                    } else if (type == 5) {
                        //请求type判断 如果为 5 更新海外留学
                        self.setData({
                            product2PullDown:true,
                            studyData: res.data.data.list
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
    getActiveData: function(pageNo, pageSize, down) {
        /*获得活动列表数据*/
        let url = app.globalData.apiUrl + '/api/v1/wonderfulActivities/wonderfulActivities/' + pageNo + '/' + pageSize;
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

                    //上拉加载更多
                    if (res.data.data.hasNextPage == false) {
                        //没有数据则不可上拉
                        self.setData({
                            activeUp: false,
                            activeUpData:[]
                        })
                    }
                    if (pageNo == 1) {
                        //判断是否请求第一页
                        self.setData({
                            activePullDown:true,
                            activeData: res.data.data.list
                        })
                    } else {
                        //有数据 加入到数组中
                        self.setData({
                            activeUpData:[],
                            activeData: self.data.activeData.concat(res.data.data.list)
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
    onPullDownRefresh: function() {
        /* json文件配置enablePullDownRefresh 为true 可调用此方法*/
        //wx.showNavigationBarLoading();
        if (this.data.currentTab == 0) {
            if (this.data.currentChildTab == 0) {
                this.setData({
                    hotUp: true,
                    hotPullDown:false,
                    pageNo:1,
                })
                /* 加载 财经早班车 数据 */
                this.getNewsData('financialEarlyTrain', 1, this.data.pageSize, 'down');
            } else {
                 this.setData({
                    teachUp: true,
                    teachPullDown:false,
                    pageNo:1,
                })
                /* 加载 投教讲堂 数据 */
                this.getNewsData('forTeaching', 1, this.data.pageSize, 'down');
            }
        } else if (this.data.currentTab == 1) {
            this.setData({
                product1PullDown:false,
                product2PullDown:false,
                pageNo:1,
            })
            /* 加载 海外置业 数据 */
            this.getProductData(4, 1, 3, 'down');
            /* 加载 海外留学 数据 */
            this.getProductData(5, 1, 3, 'down');
        } else if (this.data.currentTab == 2) {
            /* 加载鑫享会数据 */
            this.getExclusiveData('down')
            this.valueAddedService('down')
        }else{
             this.setData({
                activeUp: true,
                activePullDown:false,
                pageNo:1,
            })
            /* 加载 活动 数据 */
            this.getActiveData(1, this.data.pageSize, 'down');
        }
    },
    onReachBottom: function() {
        /*
            上拉加载更多 距离底部50px时触发一次
            json文件配置onReachBottomDistance 可修改距离底部触发的像素
        */
        if (this.data.currentTab == 0) {
            if (this.data.currentChildTab == 0) {
                console.log(this.data.hotUp)
                if (this.data.hotUp) {
                    this.setData({
                        pageNo: this.data.pageNo + 1,
                        hotUpData:[0,1,2,3],
                    });
                    /* 加载 财经早班车 数据 */
                    setTimeout(()=>{
                        this.getNewsData('financialEarlyTrain', this.data.pageNo, this.data.pageSize);
                    },200);
                }
            } else {
                if (this.data.teachUp) {
                    this.setData({
                        pageNo: this.data.pageNo + 1,
                        teachUpData:[0,1,2,3],
                    });
                    /* 加载 投教讲堂 数据 */
                    setTimeout(()=>{
                        this.getNewsData('forTeaching', this.data.pageNo, this.data.pageSize); 
                    },200)
                }
            }
        } else if (this.data.currentTab == 2) {
            if (this.data.activeUp) {
                this.setData({
                    pageNo: this.data.pageNo + 1,
                    activeUpData:[0,1,2,3],
                });
                /* 加载 活动 数据 */
                setTimeout(()=>{
                    this.getActiveData(this.data.pageNo, this.data.pageSize);
                },200)
            }   
        }
        
    },
    onPageScroll: function(e) {
        /*
          页面滚动高度大于300时 显示返回顶部按钮
                  滚动高度小于300时 隐藏返回顶部按钮
        */
        if (e.scrollTop > 500) {
            this.setData({
                returnTop: true
            })
        } else {
            this.setData({
                returnTop: false
            })
        }
    },
    returnToTop: function() {
        //返回顶部按钮 页面的滚动高度归零
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
        })
    },
    toPage: function(e) {
        //跳转详情页
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../find/page/page?id=' + id + '&type=' + type
        })
    },
    toDetail: function(e){
        //跳转详情页
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../find/product/product?id=' + id + '&type=' + type
        })
    },
    showManager: function() {
        //是否显示预约理财师按钮
        let url = app.globalData.apiUrl + '/api/v1/service/validateOther';
        let self = this;
        if (wx.getStorageSync('token')) {
            libs.requestAuto(url).then(res => {
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
            });
        } else {
            //未登录改为未绑定
            self.setData({
                bindManager: false
            })
        }
    },
  onShareAppMessage: function () {
    let time = parseInt(new Date().getTime() / 1000);
    //微信自带分享分享
    return {
      title: "专业资产配置服务品牌",
      path: "/pages/home/home",
      imageUrl: "http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/share-img.png?" + time
    };
  }
})