// register page
var api = getApp().globalData.apiUrl;//调用全局变量
let Captcha = require('../../utils/captcha.js')

Page({
  data: {
    source: '',
    mobile: '', // 手机号码
    userClear: true,
    imgCaptcha: '', // 图像验证码
    imgClear: true,
    textCaptcha: '',
    textClear: true,
    imgUrl: api + '/captcha.png',
    counting: false, // 是否是在获取短验倒计时ing
    seconds: 60, // 倒计时
    isNext: false, // 是否是点击下一步
    showNext: false, // 显示下一步按钮
    num: ''
  },
  onLoad: function (opt) {
    if(opt.source) {
      this.setData({
        source: opt.source
      })
    } 
  },
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
  inputMobile: function (e) { // 绑定mobile输入框输入
    if (e.detail.value != '') {//如果输入则显示清除图标
      this.setData({
        mobile: e.detail.value,
        userClear: false
      });
    } else {
      this.setData({
        mobile: e.detail.value,
        userClear: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  clearMobile: function () {//清除用户名输入框内容
    this.setData({
      userClear: true,
      mobile: ""
    });
  },
  inputImg: function (e) { // 绑定图像验证输入
    if (e.detail.value != '') {
      this.setData({
        imgCaptcha: e.detail.value,
        imgClear: false
      });
    } else {
      this.setData({
        imgCaptcha: e.detail.value,
        imgClear: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  inputText: function (e) { // 绑定短信验证输入
    if (e.detail.value != '') {
      this.setData({
        textCaptcha: e.detail.value,
        textClear: false
      });
    } else {
      this.setData({
        textCaptcha: e.detail.value,
        textClear: true
      });
    }
    this.testNextstep() // 监听input时是否达到显示下一步按钮的条件
  },
  getText: function (e) { // 获取短信验证码
    let that = this
    let postUrl = api + '/api/v1/system/getMobileCaptcha/' + that.data.mobile + '/' + 2
    
    if (that.testInput(that.data.isNext) && that.testImgCaptcha()){
      // 发送短信验证码
      
      wx.request({
        url: postUrl,
        data: {},
        success: function (res) {
          if (res.data.meta.success) { // 请求成功 
            that.showTip('短信已发送')
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
          }else{
            that.showTip(res.data.meta.message)
          }
        },
        fail: function (e) {
          console.log(e)
        }
      })
    }

  },
  postData: function () { // 点击下一步
    let that = this
    let postUrl = api + '/api/v1/system/validateMobileCaptcha/' + that.data.mobile + '/' + that.data.textCaptcha

    let url = '../regist/setpwd/setpwd?mobile=' + that.data.mobile
    if(this.data.source) url += '&source=' + that.data.source

    wx.request({
      url: postUrl,
      data: {},
      success: function (res) {
        if (res.data.meta.success) { // 请求成功 
          wx.navigateTo({ url })
        }else{
          that.showTip(res.data.meta.message)
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  showTip: function (str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 1500
    })
  },
  testInput: function(isNext){
    let that = this
    let phoneStr = /^((0\d{2,3}-\d{7,8})|(1([3589][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}))$/ //电话号码正则
    if (that.data.mobile == '') {
      that.showTip('请填写手机号码')
      return false
    } else if (!phoneStr.test(that.data.mobile)){
      that.showTip('手机号不符合规则')
      return false
    } else if (that.data.imgCaptcha == '') {
      that.showTip('请填写图形验证码')
      return false
    } else if (that.data.imgCaptcha.length < 5) {
      that.showTip('请填写正确的图形验证码')
      return false
    } else if (isNext) {
      if (that.data.textCaptcha == ''){
        that.showTip('请填写短信验证码')
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  },
  testNextstep: function(){
    let that = this
    if (that.data.mobile !== '' && that.data.imgCaptcha !== '' && that.data.textCaptcha !== ''){
      that.setData({
        showNext: true
      })
    } else {
      that.setData({
        showNext: false
      })
    }
  },
  testImgCaptcha: function () {
    if (this.data.num.toLowerCase() == this.data.imgCaptcha) {
      return true
    } else {
      this.onReady()
      this.showTip('图形验证码错误')
      return false
    }
  },
  getNewImg: function (e) { //获取新的图片验证码
    // 拼接随机数的url，防止缓存
    let num = Math.ceil(Math.random() * 100);
    this.setData({
      imgUrl: api + '/captcha.png?' + num
    })
  }
})
