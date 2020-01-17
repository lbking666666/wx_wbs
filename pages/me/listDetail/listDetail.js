// 详情页面
var api = getApp().globalData.apiUrl; //调用全局变量
var util = require('../../../utils/util.js');

Page({
    data: {
        productId: '', // 预约ID
        investId: '', // 优点ID, 类固收使用
        investStatu: 1, // 0: 投资中 ； 1：已回款
        productType: 1, // 1: 类固收 ； 2、3、4、5、6：其他
        inviteMoney: '100, 000',
        detailData: {}, // ajax请求得来的数据
        dataList: [],
        pdfList: [],
        hasPdf: false,
        hasReturn: false
    },
    onLoad: function(options) { // 生命周期函数--监听页面加载
        if (options.type == 1) {
            this.setData({
                investStatu: options.refundStatus,
                productType: options.type,
                productId: options.id,
                investId: options.investId
            })
        }
        this.setData({ // 除了类固收，其他不需要 investId（优点id）
            investStatu: options.refundStatus,
            productType: options.type,
            productId: options.id
        })

        this.getData()
    },
    onReady: function() { // 生命周期函数--监听页面初次渲染完成

    },
    getData: function() { // 获取detailData的ajax 方法
        wx.showLoading({
            title: '加载中'
        })

        if (this.data.productType == 1) { // 类固收
            let postUrl = api + '/api/v1/mine/investInfo'
            let that = this
            let fId = this.data.productId
            let iId = this.data.investId
            // 坑点：不让传 null ，换成 ‘’
            if (fId == 'null') {
                fId = ''
            }
            if (iId == 'null') {
                iId = ''
            }
            let data = {
                id: fId, // 预约ID
                investId: iId // 优点ID id 和 investId 只能有一个
            }
            util.checkToken().then(res => {
                //检查token是否过期
                //token未过期
                if (res.data.meta.success) {
                    wx.request({
                        url: postUrl,
                        dataType: 'json',
                        data: data,
                        method: "POST",
                        header: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'token': wx.getStorageSync('token')
                        },
                        success: function(res) {
                            if (res.data.meta.success) { // 请求成功 
                                let returnData = res.data.data.prdReservationVO
                                let returnList = res.data.data.refundScheduleList
                                let pdfList = returnData.prdAttachment
                                returnData.memo = that.formatMoney(returnData.memo, 2)
                                returnData.signAmount = that.formatMoney(returnData.signAmount, 2)
                                returnData.earnings = that.formatMoney(returnData.earnings, 2)

                                if (returnList && returnList.length !== 0) {
                                    for (let i = 0; i < returnList.length; i++){
                                      returnList[i].amount = that.formatMoney(returnList[i].amount, 2)
                                      returnList[i].earn = that.formatMoney(returnList[i].earn, 2)
                                    }
                                    
                                    that.setData({
                                        hasReturn: true
                                    })
                                }
                                if (pdfList && pdfList.length !== 0) {
                                    that.setData({
                                        hasPdf: true
                                    })
                                }
                                that.setData({
                                    detailData: returnData,
                                    dataList: returnList,
                                    pdfList: pdfList
                                })
                                wx.hideLoading() // 结束loading
                            } else {
                                console.log('请求失败')
                                wx.hideLoading() // 结束loading
                            }
                        },
                        fail: function(e) {
                            console.log(e)
                            wx.hideLoading() // 结束loading
                        }
                    })
                } else {
                    //token过期
                    //重新自动登录
                    util.login().then(res => {
                        if (res.data.meta.success) {
                            wx.request({
                                url: postUrl,
                                dataType: 'json',
                                data: data,
                                method: "POST",
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded',
                                    'token': wx.getStorageSync('token')
                                },
                                success: function(res) {
                                    if (res.data.meta.success) { // 请求成功 
                                        let returnData = res.data.data.prdReservationVO
                                        let returnList = res.data.data.refundScheduleList
                                        let pdfList = returnData.prdAttachment
                                        returnData.memo = that.formatMoney(returnData.memo, 2)

                                        if (returnList && returnList.length !== 0) {
                                            that.setData({
                                                hasReturn: true
                                            })
                                        }
                                        if (pdfList && pdfList.length !== 0) {
                                            that.setData({
                                                hasPdf: true
                                            })
                                        }
                                        that.setData({
                                            detailData: returnData,
                                            dataList: returnList,
                                            pdfList: pdfList
                                        })
                                        wx.hideLoading() // 结束loading
                                    } else {
                                        console.log('请求失败')
                                        wx.hideLoading() // 结束loading
                                    }
                                },
                                fail: function(e) {
                                    console.log(e)
                                    wx.hideLoading() // 结束loading
                                }
                            })
                        }
                    })
                }
            })

        } else { // 非类固收
            let refundStatus = refundStatus
            let postUrl = api + '/api/v1/mine/selectFundDetial/' + this.data.productId + '/' + this.data.productType + '/' + this.data.investStatu
            let that = this
            util.requestAuto(postUrl).then(res => {
                if (res.data.meta.success) { // 请求成功 
                    let returnData = res.data.data
                    returnData.netValue = ((returnData.netValue) * 1).toFixed(4)
                    if (returnData.prdAttachmentList && returnData.prdAttachmentList.length !== 0) {
                        that.setData({
                          detailData: returnData,
                          hasPdf: true,
                          pdfList: returnData.prdAttachmentList
                        })
                    } else {
                        that.setData({
                          detailData: returnData,
                          hasPdf: false,
                          pdfList: []
                        })
                    }
                    wx.hideLoading() // 结束loading
                } else {
                    console.log('请求失败')
                    wx.hideLoading() // 结束loading
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
            })
        }
    },
    formatMoney: function(money, decNum) {
        let moneyStr = util.formatMoney(money, decNum)
        return moneyStr
    },
    openPdf: function(e) { // 打开pdf

        let pdfurl = e.currentTarget.dataset.pdflink.toString();
        let aliUrl = 'https://xm-file.oss-cn-beijing.aliyuncs.com/';
        let downUrl = 'https://xmfile.xmrxcaifu.com/';
        if(pdfurl.indexOf(aliUrl) != -1){
            pdfurl =  pdfurl.replace(aliUrl,downUrl);
        }
        wx.showLoading({
            title: '加载中',
        });
        wx.downloadFile({
            url: pdfurl,
            success: function(res) {
                // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                if (res.statusCode === 200) {
                    let filePath = res.tempFilePath
                    wx.openDocument({
                        filePath: filePath,
                        success: function(res) {
                            //关闭加载中
                            wx.hideLoading();
                            console.log('open PDF OK')
                        },
                        fail: function(res) {
                            wx.showToast({
                                title: '无法打开该PDF文件',
                                icon: 'none',
                                duration: 2000
                            })
                            setTimeout(function() {
                                wx.hideToast()
                            }, 2000)
                        }
                    })
                } else {
                    wx.showToast({
                        title: '文件下载失败',
                        icon: 'none',
                        duration: 2000
                    })
                    setTimeout(function() {
                        wx.hideToast()
                    }, 2000)
                }
            }
        })
    },
    onPullDownRefresh: function() { // 页面相关事件处理函数--监听用户下拉动作

    },
    onReachBottom: function() { //页面上拉触底事件的处理函数

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