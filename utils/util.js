/*********************************************************************
作者：吕彬
Q  Q：286504720
手机：15145090813（微信同号）
util.js 方法
*********************************************************************/
let baseUrl = 'https://t1wealth.xmrxcaifu.com';
// 'https://t1wealth.xmrxcaifu.com';
// 'https://t1-hrb.xmrxcaifu.com'
//'https://wealth.xmrxcaifu.com',//正式环境
//登录获取token
function login() {
    var username = wx.getStorageSync('loginUser');
    var password = wx.getStorageSync('loginPass');
    return new Promise(function(resolve, reject) {
        wx.request({
            url: baseUrl + '/api/v1/system/login',
            data: {
                username: username, //获取用户名
                password: password, //获取密码
                did: 1,
                deviceToken: 1,
                type: 'smart', //类型 小程序
            },
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
                if (res.data.meta.success) {
                    //存储token
                    wx.setStorageSync('token', res.data.data.token);
                    resolve(res);
                } else if(res.data.meta.message == '用户名或密码错误') {
                    //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    //清空用户名和密码
                     wx.setStorageSync('loginUser', '');
                     wx.setStorageSync('loginPass','');
                    console.log(res.data.meta.message)
                }else{
                     //接口返回错误 提示框打印错误原因
                    wx.showToast({
                        title: res.data.meta.message,
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(res.data.meta.message)
                }
            }
        })
    })
}

//授权自动登录
function loginAuto() {
    let self = this;
    return new Promise(function(resolve, reject) {
        return wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    
                    // 已经授权
                    if (wx.getStorageSync('loginUser')) {
                        return checkToken().then(res => {
                            if (res.data.meta.success == false)

                                resolve(login());
                        })
                    }
                }
            }
        })
    });
}

//需要token的接口 get接口
function requestToken(url) {
    return new Promise(function(resolve, reject) {
        wx.request({
            url: url,
            method: "GET",
            header: {
                "token": wx.getStorageSync('token')
            },
            success: function(res) {
                resolve(res);
            },
            fail: function(e) {
                reject(e);
            }
        })
    })
}

//验证token是否过期
function checkToken() {
    return new Promise(function(resolve, reject) {
        wx.request({
            header: {
                "token": wx.getStorageSync('token')
            },
            url: baseUrl + '/api/v1/system/validateToken',
            success: function(res) {
                resolve(res);
            },
            fail: function(e) {
                reject(e)
            }
        })
    })
}

/* 
    如果用户允许授权  可以自动登录
    如果用户的token过期 调用登录接口获取新的token
    再次调用一遍需要token的接口
*/
function requestAuto(url) {
    return checkToken().then(res => {
        if (res.data.meta.success) {
            return requestToken(url);
        } else if (res.data.meta.message == 'please login') {
            if (wx.getStorageSync('loginUser')) {
                return login().then(loginRes => {
                    return requestToken(url).then(tokenRes => {
                        return Promise.resolve(tokenRes)
                    });
                })
            } else {
                if(wx.getStorageSync('token')){
                    wx.setStorageSync('token', '');
                    wx.showToast({
                        title: '登录超时',
                        icon: 'none',
                        duration: 2000
                    })
                }else{
                    wx.showToast({
                        title: '请登录',
                        icon: 'none',
                        duration: 2000
                    })
                }
                let url =  '/pages/login/login';
                setTimeout(function() {
                    wx.navigateTo({
                        url:url
                    })
                }, 300);
            }
        } else if (res.data.meta.message == 'please again login') {
            wx.setStorageSync('token', '');
            wx.showToast({
                title: '账号已在另一个设备上登录',
                icon: 'none',
                duration: 3000
            })
            setTimeout(function() {
                wx.navigateTo({
                    url: '/pages/login/login'
                })
            }, 300);
        }
    })
}


// 格式化金额
function formatMoney(num, decNum) { // decNum: 保留几位小数
    if (typeof(num) === 'undefined' || num == null)
        return '';
    if (typeof(num) != 'string')
        num = num.toString();
    num = num.replace(/,/g, '');

    if(num*1 == 0){
      let str = (num * 1).toFixed(decNum)
      return str
    }else{
      let FloatNum = ((num * Math.pow(10, decNum)).toFixed(0)).toString();
      let decimalStr = FloatNum.substring(FloatNum.length - decNum);
      num = FloatNum.substring(0, FloatNum.length - decNum);
      // if (decNum > 0){
      //   num = numArray[0]
      //   decimal = numArray[1]
      // }else{
      //   decimal = '00'
      // }

      let spec1 = num.indexOf('-');
      num = num.replace(/-/, '');
      let arr1 = num.split('.');
      let arr2 = [];
      let temp = arr1[0];
      while (temp.length > 3) {
        arr2.push(temp.substr(temp.length - 3, 3));
        temp = temp.substr(0, temp.length - 3);
      }
      if (temp)
        arr2.push(temp);
      arr2.reverse();
      let str = arr2.join(',');
      if (spec1 === 0)
        str = '-' + str;
      if (arr1.length > 1)
        str = str + '.' + arr1[1];
      if (decNum > 0)
        str = str + '.' + decimalStr;

      return str;
    }
}

module.exports = {
    login: login,
    loginAuto: loginAuto,
    requestToken: requestToken,
    requestAuto: requestAuto,
    formatMoney: formatMoney,
    checkToken: checkToken,
    baseUrl: baseUrl
}