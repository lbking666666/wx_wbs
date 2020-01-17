// setpassword page
var app = getApp();
var api = app.globalData.apiUrl;//调用全局变量

Page({
  data: {
    source: '',
    passwordA: '', // 第一遍pwd
    clearA: true,
    passwordB: '', // 第二遍pwd
    clearB: true,
    hasAgree: true, // 已经同意协议
    ableConfirm: false, // 满足下一步按钮出现条件
    mobile: ''
  },
  onLoad: function (options) { // 获取上一页传递的 mobile
    if(options.source) {
      this.setData({
        source: options.source
      })
    }
    this.setData({
      mobile: options.mobile
    })
  },
  inputPassA: function (e) { // 绑定输入框输入
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        passwordA: e.detail.value,
        clearA: false
      });
    } else {
      this.setData({
        passwordA: e.detail.value,
        clearA: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  clearPassA: function () {//清除用户名输入框内容
    this.setData({
      clearA: true,
      passwordA: ''
    });
  },
  inputPassB: function (e) { // 绑定输入框输入
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        passwordB: e.detail.value,
        clearB: false
      });
    } else {
      this.setData({
        passwordB: e.detail.value,
        clearB: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  clearPassB: function () {//清除用户名输入框内容
    this.setData({
      clearB: true,
      passwordB: ''
    });
  },
  testNextstep: function () { // 是否达到显示下一步按钮的条件
    let that = this
    if (that.data.passwordA !== '' && that.data.passwordB !== '') {
      that.setData({
        ableConfirm: true
      })
    } else {
      that.setData({
        ableConfirm: false
      })
    }
  },
  changeAgree: function (e) { // 点击checkbox
    this.setData({
      hasAgree: !this.data.hasAgree
    })
  },
  confirmInput: function(){
    let that = this
    if (that.testInput()){
      // 调用注册接口
      let data = {
        mobile: that.data.mobile,
        password: that.data.passwordA
      }
      if(this.data.source) {
        data["registerSource"] = that.data.source
      }
      let postUrl = api + '/api/v1/system/registerSubmit'

      wx.request({
        url: postUrl,
        data: data,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          if (res.data.meta.success) {
            that.tipShow('注册成功')
            setTimeout(function(){
              that.login()
            },
            1000)
          }else{
            that.tipShow(res.data.meta.message)
            return false
          }
        },
        fail: function (e) {
          console.log(e)
        }
      })
    }
  },
  login: function(){
    let that = this
    let loginData = {
      username: that.data.mobile,
      password: that.data.passwordA,
      did: 1,
      deviceToken: 1,
      type: 'smart'
    }
    let loginUrl = api + '/api/v1/system/login'
    wx.request({
      url: loginUrl,
      data: loginData,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.meta.success) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('loginUser', that.data.mobile);
          wx.setStorageSync('loginPass', that.data.passwordA);
          app.globalData.reloadMe = true;
          if(that.data.source) { 
            wx.navigateBack({
              delta: 3
            }); 
          } else {
            wx.switchTab({
              url: "../../me/me"
            })
          }
        }else{
          that.tipShow(res.meta.message, 2000);
          return false;
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  testInput: function() {
    let passReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/
    if (!this.data.hasAgree) {
      this.tipShow('请仔细阅读并同意《注册服务协议》')
      return false
    } else if (this.data.passwordA == '') {
      this.tipShow('密码不能为空')
      return false
    } else if (this.data.passwordA.length < 6) {
      this.tipShow('密码最小长度为6位')
      return false
    } else if (this.data.passwordA.length > 18) {
      this.tipShow('密码最大长度为18位')
      return false
    } else if (!passReg.test(this.data.passwordA)) {
      this.tipShow('密码必须为数字和字母组合')
      return false
    } else if (this.data.passwordB == '') {
      this.tipShow('确认密码不能为空')
      return false
    } else if (this.data.passwordA !== this.data.passwordB) {
      this.tipShow('两次密码必须一致')
      return false
    }else if (!this.data.mobile) {
      this.tipShow('发生错误')
      return false
    }else{
      return true
    }
  },
  tipShow: function (str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 1500
    })
  },
  checkAgreement:function () {
    wx.navigateTo({
      url: "../agreement/agreement"
    })
  }
})