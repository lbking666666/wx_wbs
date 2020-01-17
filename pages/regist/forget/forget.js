//忘记密码
let Captcha = require('../../../utils/captcha.js')
var api = getApp().globalData.apiUrl;//调用全局变量

Page({
  data: {
    mobile: '', // 电话号码
    noMobile: true,
    imgCaptcha: '', // 图形验证码
    imgUrl: api + '/captcha.png', // 图形验证码地址
    textCaptcha: '', // 短信验证码
    counting: false, // 正在倒计时
    seconds: 60, // 倒计时长
    passwordA: '', // 第一遍pwd
    clearA: true,
    passwordB: '', // 第二遍pwd
    clearB: true,
    ableNext: false,
    //createCaptcha: '',
    num: '' // 初始生成的图形验证码
  },
  onLoad: function () {},
  onReady: function () {
    var that = this;
    var num = that.getRanNum();
    this.setData({
      num: num
    })
    new Captcha({
      el: 'canvas',
      width: 80,//对图形的宽高进行控制
      height: 30,
      code: num
    });
  },
  getRanNum: function () {
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var pwd = '';
    for (var i = 0; i < 5; i++) {
      if (Math.random() < 48) {
        pwd += chars.charAt(Math.random() * 48 - 1);
      }
    }
    return pwd;
  },
  inputMobile: function (e) {
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        mobile: e.detail.value,
        noMobile: false
      });
    } else {
      this.setData({
        mobile: e.detail.value,
        noMobile: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  clearMobile: function () {
    console.log(0)
    this.setData({
      noMobile: true,
      mobile: ''
    });
    this.testNextstep()
  },
  inputImg: function (e) {
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        imgCaptcha: e.detail.value
      });
    } else {
      this.setData({
        imgCaptcha: e.detail.value
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  inputText: function (e){
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        textCaptcha: e.detail.value
      });
    } else {
      this.setData({
        textCaptcha: e.detail.value
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
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
    this.testNextstep()
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
    this.testNextstep()
  },
  getText: function () { // 获取短信验证码
    let that = this
    let postUrl = api + '/api/v1/system/getMobileCaptcha/' + that.data.mobile + '/' + 0

    if(that.testInput(true) &&  that.testImgCaptcha()) {
      // 发送短信验证码
      wx.request({
        url: postUrl,
        data: {},
        success: function (res) {
          if (res.data.meta.success) { // 请求成功 
            that.setData({
              counting: true
            })
            let countTime = setInterval(function () {
              let seconds = that.data.seconds
              seconds--
              that.setData({
                seconds: seconds
              })
              if (that.data.seconds < 0) {
                clearInterval(countTime)
                that.setData({
                  seconds: 60,
                  counting: false
                })
              }
            }, 1000)
          }
        },
        fail: function (e) {
          console.log(e)
        }
      })
    }

  },
  testImgCaptcha: function(){
    if(this.data.num.toLowerCase() == this.data.imgCaptcha){
      this.tipShow('短信验证码已发送')
      return true
    }else{
      this.onReady()
      this.tipShow('图形验证码错误')
      return false
    }
  },
  resetPwd: function () {
    if (this.testInput(false)){
      this.postData()
    }
  },
  postData: function(){ // 重置密码提交
    let that = this
    let postUrl = api + '/api/v1/system/forgetSubmit/' + this.data.mobile + '/' + this.data.textCaptcha + '/' + this.data.passwordA

    wx.request({
      url: postUrl,
      data: {},
      success: function (res) {
        if (res.data.meta.success) { // 请求成功 
          wx.setStorageSync('token', '')
          that.tipShow('找回成功')
          setTimeout(function(){
            wx.navigateBack()
          },1000)
        } else {
          that.tipShow(res.data.meta.message)
          that.onReady()
          return false
        }
      },
      fail: function (e) {
        console.log(e)
        that.onReady()
        return false
      }
    })
  },
  testInput: function (isGetcaptcha) {
    let passReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/
    let phoneStr = /^((0\d{2,3}-\d{7,8})|(1([3589][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}))$/ //电话号码正则

    if (this.data.mobile == '') {
      this.tipShow('请填写手机号码')
      return false
    } else if (!phoneStr.test(this.data.mobile)) {
      this.tipShow('手机号不符合规则')
      return false
    } else if (this.data.imgCaptcha == '') {
      this.tipShow('请填写图形验证码')
      return false
    } else if (this.data.imgCaptcha.length < 5) {
      this.tipShow('请填写正确的图形验证码')
      return false
    } else if (!isGetcaptcha){
      if(this.data.textCaptcha == '') {
        this.tipShow('请填写短信验证码')
        return false
      } else if (this.data.passwordA == '') {
        this.tipShow('密码不能为空')
        return false
      } else if (this.data.passwordA.length <6) {
        this.tipShow('密码最小长度为6位')
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
      } else {
        return true
      }
    } else {
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

  testNextstep: function () { // 是否达到显示下一步按钮的条件
    let that = this
    if (that.data.mobile !== '' && that.data.imgCaptcha !== '' && that.data.textCaptcha !== '' && that.data.passwordA !== '' && that.data.passwordB !== '') {
      that.setData({
        ableNext: true
      })
    } else {
      that.setData({
        ableNext: false
      })
    }
  },
})
