/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
login.js 登录页面逻辑
*********************************************************************/
var app = getApp(); //调用全局变量

Page({
    data: {
        source: '',
        userClear: true, //清除用户名输入框内容按钮
        passClear: true, //清除密码输入框内容按钮
        isShowPassword: true, //是否明文显示密码判断
        userTxt: "", //用户名输入框内容
        passTxt: "", //密码 输入框内容
        loginUrl: app.globalData.apiUrl + '/api/v1/system/login', //api接口地址
    },
    onLoad: function(opt) {  
        if(opt.source) { 
            this.setData({
                source: opt.source
            }); 
        }
    },
    onUnload: function() {
        //我的页面点击跳转到首页
        app.globalData.returnHome = true;
    },
    bindUser: function(e) { //绑定用户名输入框
        if (e.detail.value != '') { //如果输入则显示清除图标
            this.setData({
                userClear: false,
                userTxt: e.detail.value
            });
        } else {
            this.setData({
                userClear: true,
                userTxt: e.detail.value
            });
        }
    },
    bindPass: function(e) { //绑定密码输入框
        if (e.detail.value != '') { //如果输入则显示清除图标
            this.setData({
                passClear: false,
                passTxt: e.detail.value
            });
        } else {
            this.setData({
                passClear: true,
                passTxt: e.detail.value
            });
        }
    },
    clearUserTxt: function() { //清除用户名输入框内容
        this.setData({
            userClear: true,
            userTxt: ""
        });
    },
    clearPassTxt: function() { //清除密码输入框内容
        this.setData({
            passClear: true,
            passTxt: ""
        });
    },
    eyePassTxt: function() { //点击按钮切换密码明文状态
        this.setData({
            isShowPassword: !this.data.isShowPassword,
        });
    },
    // 短信快捷登录（自动注册）
    quickLogin(e) {
        if(e.detail.userInfo){//判断是否授权
             wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl);
             let url = './quicklogin/qlogin'
             if(this.data.source) url += '?source=' + this.data.source
             wx.navigateTo({ url });
       }else{
           wx.showToast({
               title: '请授权后注册',
               icon: 'none',
               duration: 2000
           })
       }
    }, 
    quickRegist: function(e) { //跳转到注册页面
         if(e.detail.userInfo){//判断是否授权
              wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl);
              let url = '../regist/regist'
              if(this.data.source) url += '?source=' + this.data.source
              wx.navigateTo({ url });
        }else{
            wx.showToast({
                title: '请授权后注册',
                icon: 'none',
                duration: 2000
            })
        }
    },
    forgetPass: function() { //跳转到忘记密码页面
      wx.navigateTo({
        url: "../regist/forget/forget"
      });
    },
    postData: function(e) {
        //点击登录按钮 
        var phone = /^((0\d{2,3}-\d{7,8})|(1([3589][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}))$/; //电话号码正则判断（11位1开头第二位位358）
        var passReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/; //密码正则判断（6-18位字母加数字）
        if (this.data.userTxt == '') { //判断用户名输入框内容是否为空
            wx.showToast({
                title: '手机号不能为空',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (this.data.passTxt == '') { //判断密码输入框内容是否为空
            wx.showToast({
                title: '密码不能为空',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (!phone.test(this.data.userTxt)) { //判断用户名输入框内容是否符合电话号码规则
            wx.showToast({
                title: ' 手机号不符合规则',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else if (!passReg.test(this.data.passTxt)) { //判断密码输入框内容是否符合规则
            wx.showToast({
                title: ' 密码必须至少6位且为数字和字母组合',
                icon: 'none',
                duration: 2000
            })
            return false;
        } else { //验证都通过 发送请求
            if(e.detail.userInfo){//判断是否授权
                //显示加载中
                wx.showLoading({
                    title: '登录中',
                });
                let self = this;
                wx.request({
                    url: self.data.loginUrl,
                    data: {
                        username: self.data.userTxt,
                        password: self.data.passTxt,
                        did: 1,
                        deviceToken: 1,
                        type: 'smart'
                    },
                    method: "POST",
                    header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    success: function(res) {
                        if (res.data.meta.success) {
                            /*  请求成功
                                 存储token
                                 返回到我的界面
                            */
                            wx.setStorageSync('token', res.data.data.token);
                            wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl);
                            wx.setStorageSync('loginUser', self.data.userTxt);
                            wx.setStorageSync('loginPass', self.data.passTxt);
                            app.globalData.reloadMe = true;
                            wx.navigateBack();
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
            }else{//未授权
                 wx.showToast({
                    title: '请授权后登录',
                    icon: 'none',
                    duration: 2000
                })
            }
            
        }
    }

})