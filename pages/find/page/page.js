/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
page.js 详情页面逻辑
*********************************************************************/
var app = getApp(); //调用全局变量
var WxParse = require('../../../wxParse/wxParse.js');
let libs = require("../../../utils/util.js"); //调用方法
const innerAudioContext = wx.createInnerAudioContext();
Page({
    data: {
        signUpSucc: false, //报名成功弹框
        type: 0, //页面类型1:活动 2:发现 3:置业 4:留学
        id: 0, //请求id
        tab: ["基本信息", "附件"], //顶部tab
        returnTop: false, //返回顶部按钮
        bindManager: false, //是否绑定理财师
        currentTab: 0, //顶部tab当前项
        contentData: {}, //详情对象
        fileData: [], //文件列表
        pdfData: [], //pdf列表
        videoData: [], //视频列表
        phone: '4006-033-066',
        audioStatus:0,
        src: '',
        startTime:'00:00',
        totalTime:'00:00',
        duration:0,
        curTimeVal:0,
        time:parseInt(new Date().getTime() / 1000),
        videoState: 0, // 视频播放初始状态。0：未播放/暂停；1：播放ing
        msgVersion: 1, // 消息版本，1：原版本，使用顾问云的样式；2：仅传递字段，样式由自己搭建
        msgData: {}, // 当为新顾问云时，文章数据
        calendarData: {} // 当为新顾问云时，顶部日历数据
    },
    onReady: function () {
      this.videoContext = wx.createVideoContext('myVideo')
    },
    onLoad: function(options) {
        /*通过url传参 获得id和type*/
        this.setData({
            id: options.id
        });
        this.setData({
            type: options.type
        })
        //是否绑定理财师
        this.showManager();
        //获取数据
        this.getData();


    },
    onUnload: function() {
        /*
            路由进入时是发现的tab第二项即产品进入
            返回时修改全局变量 tab的当前项为第二项即产品
        */
        /*if(this.data.type == 2){
          app.globalData.gCurrentTab =0;//顶部tab当前项
        }else if(this.data.type == 1){
          app.globalData.gCurrentTab =2;
        }else if(this.data.type ==3 ||this.data.type ==4){
          app.globalData.gCurrentTab =1;
        }*/
    },
    openVideo: function () {
      this.setData({
        videoState: 1
      })

      this.videoContext.play()
    },
    toTab: function(e) {
        //海外tab点击切换事件
        this.setData({
            currentTab: e.currentTarget.dataset.idx
        })
    },
    getData: function(down) {
        let self = this;
        switch (this.data.type) {
            case '1':
                this.getActive(this.data.id, down);
                break;
            case '2':
                self.getNews(this.data.id, down);
                break;
            case '3':
                this.getProduct(this.data.id, down);
                break;
            case '4':
                this.getProduct(this.data.id, down)
                break;
        }
    },
    getNews: function(id, down) {
        /*获取热点聚焦，财富讲堂详情数据*/
        let url = app.globalData.apiUrl + '/api/v1/aboutUs/news/' + id;
        let self = this;
        let data = {
            terminal:1,
            type:4,
            courseId:id,
            articleType:1
        }
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //发送请求
        wx.request({
            url: url,
            method: "GET",
            data:data,
            success: function(res) {
                if (res.data.meta.success) {
                    //请求成功
                    self.setData({
                        contentData: res.data.data,
                        src:res.data.data.musicUrl?res.data.data.musicUrl:'',
                    })
                    innerAudioContext.src = self.data.src;
                    innerAudioContext.onCanplay(() => {      
                        innerAudioContext.duration      
                        setTimeout(function () { 
                            innerAudioContext.duration 
                            self.setData({
                                duration: innerAudioContext.duration,
                                totalTime:self.toTime(parseInt(innerAudioContext.duration))
                            })     
                        }, 100)  

                    })

                    // 在富文本转义前添加 是否是新版顾问云文章
                    self.setData({
                        msgVersion: res.data.data.version
                    })
                    if(self.data.msgVersion == 2){
                        self.setData({
                            msgData: JSON.parse(self.data.contentData.content).value
                        })
                    }
                    console.log(self.data.msgData.uris)
                    // 获取返回的最后一次更新时间
                    let lastDate = self.data.msgData.timeLastUpdated
                    if(self.data.msgVersion == 2){
                        self.setData({
                            calendarData: self.getCalendarStr(lastDate)
                        })
                    }
                    
                    //富文本转义小程序模板
                    WxParse.wxParse('newsContent', 'html', self.data.contentData.content, self, 5);
                    /*  
                        参数down标识下拉刷新
                        关闭下拉刷新状态
                     */
                    if (down) {
                        setTimeout(function() {
                            wx.hideNavigationBarLoading()
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
    // 获取顾问云的财经早报的日历时间字符串
    getCalendarStr: function(timeStr){
        let returnD = {
            monthStr: '',
            dayStr: '',
            weekStr: ''
        }
        let Dmonth = timeStr.slice(5,7)*1
        let Dday = String(timeStr.slice(8,10)*1)
        let Dtoday = new Date(timeStr.slice(0,10))
        let Dweek = Dtoday.getDay()
        let nums = ['一','二','三','四','五','六','七','八','九','十','十一','十二']
        let weeks = ['Mon','Tues','Wed','Thur','Fri','Sat','Sun']
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec']
        
        returnD.monthStr = nums[Dmonth-1] + '月·' + months[Dmonth-1]
        returnD.dayStr = Dday
        returnD.weekStr = '星期' + nums[Dweek-1] + '·' + weeks[Dweek-1]
        return returnD
    },
    toTime:function(result) {
        //转化时间
        var h = Math.floor(result / 3600) < 10 ? '0'+Math.floor(result / 3600) : Math.floor(result / 3600);
        var m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
        var s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
        return result = ((h!='00')?h+ ":":'') + m + ":" + s;
    },
    play: function (e) {
       if(this.data.audioStatus == 0){
            //播放状态
            innerAudioContext.play();
            innerAudioContext.onPlay((res) =>this.updateTime(this)) 
            this.setData({
                audioStatus:1,
            })
       }else{
            //暂停状态
            innerAudioContext.pause();
            this.setData({
                audioStatus:0,
            })
       }
        
    },
   /* pause:function(){
        innerAudioContext.pause();
    },*/
    updateTime:function(that){
        innerAudioContext.onTimeUpdate((res) => {
            that.setData({
                duration: parseInt(innerAudioContext.duration),
                curTimeVal: parseInt(innerAudioContext.currentTime),
                startTime:that.toTime(parseInt(innerAudioContext.currentTime))
            })
        })
        if (parseInt(innerAudioContext.duration) - parseInt(innerAudioContext.currentTime) == 0) {
           
            that.setStopState(that)
        }
        innerAudioContext.onEnded(() => {that.setStopState(that)})
    },
    process:function(){
        this.setData({
            audioStatus:1,
        })
        innerAudioContext.pause();
    },
    slideBar:function(e){
        let that=this;
        var curval=e.detail.value; 
        console.log(curval)
        innerAudioContext.seek(curval);
        that.setData({
            startTime:that.toTime(parseInt(curval)),
            audioStatus:0,
        })
        innerAudioContext.onSeeked((res)=>{
           //that.updateTime(that)
            that.play();
        })
    },
    setStopState:function(that){
        that.setData({
            curTimeVal: 0,
            audioStatus:1,
            startTime:'00:00'
        })
        innerAudioContext.stop()
    },
    getProduct: function(id, down) {
        /*获取热点聚焦，财富讲堂详情数据*/
        let self = this;
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //判断用户是否登录
        let token = wx.getStorageSync('token');
        if (token) {
            //登录请求接口
            let url = app.globalData.apiUrl + '/api/v1/service/getProductInfo/' + id;
            libs.requestAuto(url).then(res => {
                if (res.data.meta.success) {
                    //请求成功
                    self.setData({
                        contentData: res.data.data.productInfo, //详情信息
                        fileData: res.data.data.prdAttachment, //文件列表
                        phone: res.data.data.faMobile|| '4006-033-066', //理财师手机号
                    })
                    //创建两个数组存储pdf和视频
                    let pdfArr = [],
                        videoArr = [];
                    //将文件列表拆分到两个数组中
                    self.data.fileData.map(item => {
                        if (item.type == 1) {
                            pdfArr.push(item);
                        } else if (item.type == 2) {
                            videoArr.push(item)
                        }
                    })
                    //页面渲染视频和pdf列表
                    self.setData({
                        pdfData: pdfArr,
                        videoData: videoArr
                    })
                    /*富文本转义小程序模板*/
                    //详情内容
                    WxParse.wxParse('productContent', 'html', self.data.contentData.introduction, self, 5);
                    //风险提示内容
                    WxParse.wxParse('riskContent', 'html', self.data.contentData.riskInformation, self, 5);
                    /*  
                        参数down标识下拉刷新
                        关闭下拉刷新状态
                     */
                    if (down) {
                        setTimeout(function() {
                            wx.hideNavigationBarLoading()
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
            });
        } else {
            let url = app.globalData.apiUrl + '/api/v1/service/smartGetProductInfo/' + id;
            //发送请求
            wx.request({
                url: url,
                method: "GET",
                success: function(res) {
                    console.log(res.data)
                    if (res.data.meta.success) {
                        //请求成功
                        self.setData({
                            contentData: res.data.data.productInfo, //详情信息
                            fileData: res.data.data.prdAttachment, //文件列表
                        })
                        //创建两个数组存储pdf和视频
                        let pdfArr = [],
                            videoArr = [];
                        //将文件列表拆分到两个数组中
                        self.data.fileData.map(item => {
                            if (item.type == 1) {
                                pdfArr.push(item);
                            } else if (item.type == 2) {
                                videoArr.push(item)
                            }
                        })
                        //页面渲染视频和pdf列表
                        self.setData({
                            pdfData: pdfArr,
                            videoData: videoArr
                        })
                        /*富文本转义小程序模板*/
                        //详情内容
                        WxParse.wxParse('productContent', 'html', self.data.contentData.introduction, self, 5);
                        //风险提示内容
                        WxParse.wxParse('riskContent', 'html', self.data.contentData.riskInformation, self, 5);


                        /*  
                            参数down标识下拉刷新
                            关闭下拉刷新状态
                         */
                        if (down) {
                            setTimeout(function() {
                                wx.hideNavigationBarLoading()
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
        }
    },
    getActive: function(id, down) {
        /*获取活动详情数据*/
        let url = app.globalData.apiUrl + '/api/v1/wonderfulActivities/activitiesOne/' + id;
        let self = this;
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        if (wx.getStorageSync('token')) {
            libs.requestAuto(url).then(res => {
                if (res.data.meta.success) {
                    console.log(res.data)
                    if(res.data.data.faidPhone){}
                    //请求成功
                    self.setData({
                        contentData: res.data.data,
                        phone: res.data.data.faidPhone|| '4006-033-066'
                    })
                    //富文本转义小程序模板
                    WxParse.wxParse('activeContent', 'html', self.data.contentData.content, self, 5);
                    /*  
                        参数down标识下拉刷新
                        关闭下拉刷新状态
                     */
                    if (down) {
                        setTimeout(function() {
                            wx.hideNavigationBarLoading()
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
            });
        } else {
            //发送请求
            wx.request({
                url: url,
                method: "GET",
                success: function(res) {
                    if (res.data.meta.success) {
                         
                        //请求成功
                        self.setData({
                            contentData: res.data.data
                        })
                          
                        //富文本转义小程序模板
                        WxParse.wxParse('activeContent', 'html', self.data.contentData.content, self, 5);
                        /*  
                            参数down标识下拉刷新
                            关闭下拉刷新状态
                         */
                        if (down) {
                            setTimeout(function() {
                                wx.hideNavigationBarLoading()
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
        }

    },
    playVideo: function(e) {
        //视频列表点击播放视频
        let url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: '../../find/video/video?url=' + url
        })
    },
    toPdf:function(e){
        //咨询点击pdf
        let url = e.currentTarget.dataset.url.toString();
        let aliUrl = 'https://xm-file.oss-cn-beijing.aliyuncs.com/';
        let downUrl = 'https://xmfile.xmrxcaifu.com/';
        if(url.indexOf(aliUrl) != -1){
            url =  url.replace(aliUrl,downUrl);
        }
        let Turl = app.globalData.apiUrl + '/api/v1/aboutUs/newsLog/' +this.data.id + '/3';
        let self = this;
         //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        libs.requestAuto(Turl).then(res => { 
            if(res){
                if (res.data.meta.success) {
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
                } else {
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(res.data.meta.message)
                     //关闭加载中
                    setTimeout(function() {
                        wx.hideLoading();
                    }, 200)
                }
            }
            
           
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
        });
    },
    pdfOpen: function(e) {
        //预览pdf

        let url = e.currentTarget.dataset.url.toString();
        let aliUrl = 'https://xm-file.oss-cn-beijing.aliyuncs.com/';
        let downUrl = 'https://xmfile.xmrxcaifu.com/';
        if(url.indexOf(aliUrl) != -1){
            url =  url.replace(aliUrl,downUrl);
        }
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
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
    callPhone: function() {
        let self = this;
        wx.showModal({
            content: self.data.phone,
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.makePhoneCall({
                        phoneNumber: self.data.phone //拨打电话
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
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
    // onPullDownRefresh: function() {
    //     //页面下拉刷新
    //     wx.showNavigationBarLoading();
    //     this.getData('down');
    //     /*setTimeout(function() {
    //         wx.hideNavigationBarLoading()
    //         wx.stopPullDownRefresh();
    //     }, 2000)*/
    // },
    onShareAppMessage: function() {
        //微信自带分享分享
        //定义分享 标题  图片
        let title, imgUrl;
        //判断页面类型  type: 0, //页面类型1:活动 2:发现 3:置业 4:留学
        if (this.data.type == 1) {
            title = this.data.contentData.actTitle;
            imgUrl = ''//this.data.contentData.pictureUrl;
        } else if (this.data.type == 2) {
            title = this.data.contentData.title;
            imgUrl = this.data.contentData.picpath;
        } else if (this.data.type == 3 || this.data.type == 4) {
            title = this.data.contentData.name;
            imgUrl = ''//this.data.contentData.smallPic
        }
        return {
            title: title,
            path: "/pages/find/page/page?type="+this.data.type+"&id="+this.data.id,
            imageUrl: imgUrl
        };
    },    
    // 报名
    setAppointment() {  
        let url = app.globalData.apiUrl + '/api/v1/wonderfulActivities/registrationPrivileges/' + this.data.id;
        let self = this; 
        //显示加载中
        wx.showLoading({
            title: '加载中',
        });
        //发送请求
        wx.request({
            url: url,
            method: "GET", 
            header: {
                token: wx.getStorageSync('token')
            },
            success: function(res) {  
                if (res.data.meta.success) {  
                    //请求成功
                    self.setData({
                        "contentData.yes" : true,
                        signUpSucc: true
                    })      
                    setTimeout(() => {
                        self.setData({
                            signUpSucc: false
                        })
                    }, 2000); 
                } else if (res.data.meta.code == "AUTHENTICATION_ERROR") {
                    wx.navigateTo({
                        url: '/pages/login/login?source=3'
                    })
                } else {
                    if(res.data.meta.message == '您已经报名成功，请勿重复报名') {
                        self.setData({
                            "contentData.yes" : true
                        })  
                    }    
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
            },
            fail: function(e) {
                //关闭加载中
                setTimeout(function() {
                    wx.hideLoading();
                }, 200)
            }
        })
      },
})