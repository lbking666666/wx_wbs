/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
manager.js 预约理财师页面逻辑
*********************************************************************/
var app = getApp(); //调用全局变量
var phone = /^((0\d{2,3}-\d{7,8})|(1([3589][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}))$/; //电话号码正则判断（11位1开头第二位位358）
var codePhone = '';
Page({
    data: {
        userTxt: "", //姓名 输入框内容
        phoneTxt: "", //手机号码 输入框内容
        codeTxt: "", //图形验证码 输入框内容
        messageTxt: "", //短信验证码 输入框内容
        imgUrl: "", //图形验证码url
        sendCode: false, //是否显示倒计时
        seconds: 60, //倒计时开始时间
    },
    onLoad: function() {
        /*首页加载一次图形验证码的接口返回cookie存入到全局变量的header中*/
        this.initCaptcha()
    },
    inputUser: function(e) {
        // 图形验证码输入框内容更新
        this.setData({
            userTxt: e.detail.value
        })
    },
    inputPhone: function(e) {
        // 图形验证码输入框内容更新
        this.setData({
            phoneTxt: e.detail.value
        })
    },
    inputCode: function(e) {
        // 图形验证码输入框内容更新
        this.setData({
            codeTxt: e.detail.value
        })
    },
    inputMessage: function(e) {
        // 图形验证码输入框内容更新
        this.setData({
            messageTxt: e.detail.value
        })
    },
    initCaptcha: function() {
        /*初始时 传入假的图形验证码1111 走一遍接口一遍能够获得服务器response的cookie*/
        let url = app.globalData.apiUrl + '/api/v1/wxInvReser/validatePictureCaptcha/1111';
        wx.request({
            header: app.globalData.header,
            url,
            data: {},
            success: (res) => {
                //存储cookie
                this.setSessionId(res);
                //获得图形验证码
                this.codeImg();
            }
        })
    },
    codeImg: function() {
        //获得图形验证码的图片加入随机数防止图片缓存
        var num = Math.ceil(Math.random() * 100);
        let url = app.globalData.apiUrl+'/captcha.png?' + num
        //下载到本地 主要作用走一遍netWork 
        wx.downloadFile({
            header: app.globalData.header,
            url,
            success: (res) => {
                this.setData({
                    //更换图形验证码地址
                    imgUrl: res.tempFilePath
                });
            }
        })
    },
    refreshCaptcha: function() {
        /* 更换图形验证码 */
        this.initCaptcha();
    },
    setSessionId: function(res) {
        //拿到服务器传过来的cookie
        let cookieStr = res.header['Set-Cookie'];
        //截取cookie中有效字段 JSESSIONID 后面的内容
        if (cookieStr) {
            let cookies = cookieStr.split('; ')
            if (!cookies || cookies.length <= 0)
                return;
            cookies.forEach(
                (v) => {
                    const str = v.split('=');
                    if (str[0] && str[0] == 'JSESSIONID') {
                        let sessionId = decodeURI(str[1]);
                        //在全局变量中存储cookie
                        app.globalData.header.Cookie = `JSESSIONID=${sessionId}`;
                    }
                }
            );
        }
    },
    getCode: function() {
        //点击获取短信验证码时，先验证电话号码及图形验证码
        if (this.data.phoneTxt == "") {
            wx.showToast({
                title: '请输入您的手机号',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.codeTxt == "") {
            wx.showToast({
                title: '请输入图形验证码',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (!phone.test(this.data.phoneTxt)) {
            wx.showToast({
                title: ' 手机号不符合规则',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.codeTxt.length > 6 || this.data.codeTxt.length < 4) {
            wx.showToast({
                title: ' 请输入正确的图形验证码',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else {
            let self = this;
            let url = app.globalData.apiUrl + '/api/v1/wxInvReser/validatePictureCaptcha/' + this.data.codeTxt.toLowerCase()
            //显示加载中
            wx.showLoading({
                title: '验证中',
            });
            wx.request({
                header: app.globalData.header, //发送请求并带入服务器传过来的cookie信息
                url: url,
                success: function(res) {
                    if (res.data.meta.success) {
                        //如果成功则继续下一个接口调用 获取短信验证码
                        self.getMessage();
                    } else {
                        //验证码输入错误则更新图形验证码
                        wx.showToast({
                            title: res.data.meta.message,
                            icon: 'none',
                            duration: 2000
                        })
                        self.refreshCaptcha();
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
    getMessage: function() {
        /*获取短信验证码*/
        let self = this;
        let url = app.globalData.apiUrl + '/api/v1/wxInvReser/getMobileCaptcha/' + this.data.phoneTxt;
        wx.showLoading({
            title: '提交中',
        });
        wx.request({
            url: url,
            method: "GET",
            success: function(res) {
                if (res.data.meta.success) {
                    /*  请求成功
                          提示状态
                          显示倒计时
                    */
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    self.setData({
                        sendCode: true,
                    })
                    /*
                      提交时比对手机输入框中的电话号码是否和获取短信验证码时的号码一致
                      将手机输入框中的电话号码存入到codePhone中
                    */
                    codePhone = self.data.phoneTxt;
                    //设置倒计时，及倒计时归零后 显示最初状态
                    let countTime = setInterval(function() {
                        let seconds = self.data.seconds
                        seconds--
                        self.setData({
                            seconds: seconds
                        })
                        if (self.data.seconds < 0) {
                            clearInterval(countTime)
                            self.setData({
                                seconds: 60,
                                sendCode: false
                            })
                        }
                    }, 1000)
                } else {
                    //失败时提示后台返回的内容，并不显示倒计时
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    self.setData({
                        sendCode: false,
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
                wx.showToast({
                    title: '请检查手机网络',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    sendData: function() {
        if (this.data.userTxt == '') {
            wx.showToast({
                title: '请输入您的姓名',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.phoneTxt == '') {
            wx.showToast({
                title: '请输入您的手机号',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.codeTxt == '') {
            wx.showToast({
                title: '请输入图形验证码',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.messageTxt == '') {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (!phone.test(this.data.phoneTxt)) {
            wx.showToast({
                title: '手机号不符合规则',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (codePhone != this.data.phoneTxt) {
            wx.showToast({
                title: '手机号码不一致',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else {
            let url = app.globalData.apiUrl + '/api/v1/wxInvReser/invReserApply';
            wx.request({
                url: url,
                data: {
                    invName: this.data.userTxt,
                    invMobile: this.data.phoneTxt,
                    mobileCaptcha: this.data.messageTxt
                },
                method: "POST",
                header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                success: function(res) {
                    if (res.data.meta.success) {
                        /*  请求成功
                             返回
                        */
                        wx.showToast({
                            title: '预约成功',
                            icon: 'none',
                            duration: 2000
                        })
                        setTimeout(function() {
                            wx.navigateBack()
                        }, 2000)
                    } else {
                        wx.showToast({
                            title: res.data.meta.message,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                },
                fail: function(e) {
                    console.log(e)
                }
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