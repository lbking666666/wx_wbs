/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
list.js 列表页面逻辑
*********************************************************************/
var app = getApp(); //调用全局变量
let libs = require("../../../utils/util.js"); //调用方法
Page({
    data: {
        title: ["海外置业", "海外留学", "增值服务", "高端尊享"], //页面标题
        type: 1, //页面展示判断
        returnTop: false, //返回顶部按钮
        bindManager: false, //是否绑定理财师
        listData: [], //列表数据
        pageNo: 1, //页数
        pageSize: 10, //每页请求数
        up: true, //上拉开启
        upData:[],
        down:false,//下拉刷新
        btnList: ['分类筛选','鑫积分筛选','会员级别'], 
        selectListA: [],
        selectListB: [
            {'name':'全部', 'intStart': '', 'intEnd': ''},
            {'name':'50000 鑫积分以下', 'intStart': '', 'intEnd': '50000'},
            {'name':'50000 - 100000鑫积分', 'intStart': '50000', 'intEnd': '100000'},
            {'name':'100000 - 200000鑫积分', 'intStart': '100000', 'intEnd': '200000'},
            {'name':'200000 - 300000鑫积分', 'intStart': '200000', 'intEnd': '300000'},
            {'name':'300000 - 400000鑫积分', 'intStart': '300000', 'intEnd': '400000'},
            {'name':'400000鑫积分以上',  'intStart': '400000', 'intEnd': ''}],
        selectListC: [],
        intStart: '', // 增值服务： 默认 null ，鑫积分最小为 
        intEnd: '', // 增值服务： 默认 null ，鑫积分最大为
        levelType: '', // 增值服务：筛选等级，默认 null 为全部
        privilegeSort: '', // 增值服务：筛选类型，默认 null 为全部
        clickA: false, 
        clickB: false,
        clickC: false,
        tindex: 0,
        detailList: [], // 增值服务的列表
        vipList: [], // 高端专享的列表
        titleList: [], // 高端专享的标题列表
        selAindex: 0, // 选择列表A 的 index
        selBindex: 0, // 选择列表A 的 index
        selCindex: 0, // 选择列表A 的 index
    },
    onLoad: function(options) {
        /*
          页面加载时做判断：
            type = 1，则为海外置业
            type = 2， 则为海外留学
            type = 3, 增值服务
            type = 4， 高端定制
        */
        wx.setNavigationBarTitle({
            title: this.data.title[options.type - 1] //修改页面标题
        })

        if (options.type == 1) {
            this.setData({
                type: 1 //修改页面展示判断
            })
           
            /* 加载 海外置业 数据 */
            this.getData(4, 1, this.data.pageSize);
        } else if (options.type == 2) {
            this.setData({
                type: 2 //修改页面展示判断
            })
            
            /* 加载 海外留学 数据 */
            this.getData(5, 1, this.data.pageSize);
        } else if(options.type == 3){
            this.setData({
                type: 3, //修改页面展示判断
                // detailList: [{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']}]
            })
            this.getSelectList()
            this.getAddList()
        } else if(options.type == 4){
            this.setData({
                type: 4, //修改页面展示判断
            })
            this.getVipList()
        }
        this.showManager();
    },
    /* 路由进入时是发现的tab第二项即产品进入;返回时修改全局变量 tab的当前项为第二项即产品 */
    onUnload: function() {  
        app.globalData.gCurrentTab = 1; //顶部tab当前项
    },
    /* 页面滚动高度大于300时 显示返回顶部按钮;滚动高度小于300时 隐藏返回顶部按钮 */
    onPageScroll: function(e) {
        if (e.scrollTop > 300) {
            this.setData({
                returnTop: true
            })
        } else {
            this.setData({
                returnTop: false
            })
        }
    },
    // 增值服务，获取头部选择框选择列表内容
    getSelectList: function(){
        let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipParamList';
        let self = this;

        wx.request({
            url: url,
            method: "GET",
            success: function(res) {
                if (res.data.meta.success) {
                    self.setData({
                        selectListA: res.data.data.cate,
                        selectListC: res.data.data.level
                    })
                } else {
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },fail: function(e) {
                wx.showToast({
                    title: '请检查手机网络',
                    icon: 'none',
                    duration: 2000
                })
            }
        });
    },
    // 点击增值服务顶部 tab 
    openSelector: function(e){
        let tindex = e.currentTarget.dataset.tabindex
        if(this.data.tindex == tindex){
            this.setData({
                tindex: 0
            })
        }else{
            this.setData({
                tindex: tindex
            })
        }
        if(tindex == 1){
            console.log('tabindex = 1')
            if(this.data.clickA){
                this.closeSelector()
            }else{
                this.setData({
                    clickA: true,
                    clickB: false,
                    clickC: false
                })
            }
            
        }else if(tindex == 2){
            console.log('tabindex = 2')
            if(this.data.clickB){
                this.closeSelector()
            }else{
                this.setData({
                    clickA: false,
                    clickB: true,
                    clickC: false
                })
            }
        }else if(tindex == 3){
            console.log('tabindex = 3')
            if(this.data.clickC){
                this.closeSelector()
            }else{
                this.setData({
                    clickA: false,
                    clickB: false,
                    clickC: true
                })
            }
        }
    },
    // 关闭下拉选项
    closeSelector: function(){
        this.setData({
            tindex: 0,
            clickA: false,
            clickB: false,
            clickC: false
        })
    },
    // 点击黑色背景部分
    clickSelBg: function(){
        this.closeSelector()
    },
    // 选择增值服务筛选列表
    selectOne: function(e){
        if(this.data.tindex == 1){
            this.setData({
                selAindex:  e.currentTarget.dataset.index
            })
            if(e.currentTarget.dataset.privilegesort){
                this.setData({
                    privilegeSort: e.currentTarget.dataset.privilegesort
                })
            }else{
                this.setData({
                    privilegeSort: ''
                })
            }
        }else if(this.data.tindex == 2){
            this.setData({
                selBindex:  e.currentTarget.dataset.index
            })
            if(e.currentTarget.dataset.intstart){
                this.setData({
                    intStart: e.currentTarget.dataset.intstart
                })
            }else{
                this.setData({
                    intStart: ''
                })
            }
            if(e.currentTarget.dataset.intend){
                this.setData({
                    intEnd: e.currentTarget.dataset.intend
                })
            }else{
                this.setData({
                    intEnd: ''
                })
            }
        }else if(this.data.tindex == 3){
            this.setData({
                selCindex:  e.currentTarget.dataset.index
            })
            if(e.currentTarget.dataset.level){
                this.setData({
                    levelType: e.currentTarget.dataset.level
                })
            }else{
                this.setData({
                    levelType: ''
                })
            }
        }
        // console.log(this.data)
        this.closeSelector()
        this.getAddList()
    },
    // 获取增值服务列表
    getAddList: function(down){
        let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipPrivileges'
        let self = this
        //显示加载中
        wx.showLoading({
            title: '加载中'
        })
        wx.request({
            url: url,
            data: {
                intStart: self.data.intStart,
                intEnd: self.data.intEnd,
                privilegeSort: self.data.privilegeSort,
                userLevel: self.data.levelType,
                pageNo: self.data.pageNo,
                pageSize: 6,
            },
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
                if (res.data.meta.success) {
                    if (res.data.data.hasNextPage == false) {
                        self.setData({
                            up: false,
                            upData:[],
                        })
                    }
                    if (self.data.pageNo == 1) {
                        self.setData({
                            down:true,
                            detailList: res.data.data.list
                        })
                    } else {
                        //上拉加载更多
                        self.setData({
                            upData:[],
                            down: true,
                            detailList: self.data.detailList.concat(res.data.data.list)
                        })
                        console.log(self.data.detailList)
                    }  

                    /*   参数down标识下拉刷新 , 关闭下拉刷新状态 */
                    if (down) {
                        setTimeout(function() {
                            wx.stopPullDownRefresh();
                        }, 500)
                    }
                }else{
                    console.log(res.data.meta.message)
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
                //关闭加载中
                setTimeout(function() {
                    wx.hideLoading();
                }, 200)
            }
        })
        
    },
    // 跳转到增值服务 & 高端专享 详情页
    toDetailpage: function(e){
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../../find/product/product?id=' + id + '&type=' + type
        })
    },
    // 跳转到详情页
    toVipPage: function(){

    },
    // 获取高端专享列表
    getVipList: function(down){
        let url = app.globalData.apiUrl + '/api/v1/membershipPrivileges/membershipPrivilegesHighSort'
        let self = this
        //显示加载中
        wx.showLoading({
            title: '加载中'
        })
        wx.request({
            url: url,
            method: "GET",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
                if (res.data.meta.success) {
                    let titleList = []
                    let dataList = []
                    let arrObj = res.data.data
                    for(let i in arrObj){
                        titleList.push(i)
                        dataList.push(arrObj[i])
                    }
                    console.log(titleList)
                    console.log(dataList)
                    self.setData({
                        down:true,
                        titleList: titleList,
                        vipList: dataList
                    })
                    /*   参数down标识下拉刷新 , 关闭下拉刷新状态 */
                    if (down) {
                        setTimeout(function() {
                            wx.stopPullDownRefresh();
                        }, 500)
                    }
                }else{
                    console.log(res.data.meta.message)
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
                //关闭加载中
                setTimeout(function() {
                    wx.hideLoading();
                }, 200)
            }
        })
        
    },
    getData: function(type, pageNo, pageSize, down) {
        //获取数据
      let url = app.globalData.apiUrl + '/api/v1/service/smartGetProductInfoList/' + type + '/' + pageNo + '/' + pageSize;
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
                    //请求成功 ,没有数据则不可上拉
                    if (res.data.data.hasNextPage == false) {
                        self.setData({
                            up: false,
                            upData:[],
                        })
                    }
                    if (pageNo == 1) {
                        self.setData({
                            down:true,
                            listData: res.data.data.list
                        })
                    } else {
                        //上拉加载更多
                        self.setData({
                            upData:[],
                            listData: self.data.listData.concat(res.data.data.list)
                        })
                    }  
                    /*   参数down标识下拉刷新 , 关闭下拉刷新状态 */
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
            url: '../../find/page/page?id=' + id + '&type=' + type
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
    onPullDownRefresh: function() {
        /* json文件配置enablePullDownRefresh 为true 可调用此方法*/
        //wx.showNavigationBarLoading(); //显示顶部加载图标
        this.setData({
            down:false,
            pageNo:1,
            up:true
        })

        if (this.data.type == 1) {
            /* 加载 海外置业 数据 */
            this.getData(4, 1, this.data.pageSize, 'down');
        } else if (this.data.type == 2) {
            /* 加载 海外留学 数据 */
            this.getData(5, 1, this.data.pageSize, 'down');
        } else if(this.data.type == 3) {
            this.getAddList('down')
        } else if(this.data.type == 4){
            this.getVipList('down')
        }
    },
    onReachBottom: function() {
        /*
            上拉加载更多 距离底部50px时触发一次
            json文件配置onReachBottomDistance 可修改距离底部触发的像素
        */
        if (this.data.up) {
            this.setData({
                pageNo: this.data.pageNo + 1,
                upData:[0,1,2,3]
            });
            setTimeout(()=>{
                if(this.data.type == 3){
                    this.setData({
                        type: 3, //修改页面展示判断
                        // detailList: [{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']},{level:['铂金卡','金卡','银卡']}]
                    })
                    this.getAddList()
                } else if(this.data.type == 4){
                    // this.getVipList()
                    // 列表固定，无需上拉加载更多
                }else{
                    this.getData(5, this.data.pageNo, this.data.pageSize);
                }
            },200)
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