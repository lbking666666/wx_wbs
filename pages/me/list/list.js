// pages/me/list/list.js
var util = require('../../../utils/util.js');
var api = getApp().globalData.apiUrl;//调用全局变量

Page({
  data: {
    BarTitle: ['类固定收益', 'FOF基金', '私募基金', '海外置业', '保险保障'], 
    productType: 1, //{1:'类固定收益', 2:'FOF基金', 3:'私募基金', 4:'海外置业', 5:'保险保障'}
    waitIncome: '0.00', // 待收收益（元）
    historyIncome: '0.00', // 历史收益（元）
    allInvestStr: '0.00', // 万元不要 .00  元的带
    investStr: '0.00',
    refundStatus: 0, // 列表页切换 state
    noData: true, // 列表无数据
    dataList: [] 
  },
  onLoad: function (options) {
    this.setData({
      productType: options.type
    })
    wx.setNavigationBarTitle({
      title: this.data.BarTitle[this.data.productType -1]
    })
    this.getInfo() 
  },
  onShareAppMessage: function () { // 用户点击右上角分享
      //微信自带分享分享
        return {
            title: "专业资产配置服务品牌",
            path: "/pages/home/home",
            imageUrl: "http://xm-file.oss-cn-beijing.aliyuncs.com/wchat/share-img.png"
        };
  },
  getListByStatus: function (e) { // 点击切换状态
    let status = e.currentTarget.dataset.status

    if (status == 0){
      this.fetchData(0)
    } else {
      this.fetchData(1)
    }
  },
  getInfo: function () { // 获取数据
    this.fetchData(this.data.refundStatus)
  },
  fetchData(status) { // 获取数据 并 放入数据
    wx.showLoading({
      title: '加载中'
    })

    this.setData({ // 切换tab status， 清空list
      refundStatus: status,
      dataList: []
    })

    let param = {
      categoryId: this.data.productType,
      refundStatus: status | 0,
      pageNo: 1,
      pageSize: 5
    }
    

    if (this.data.productType == 1) {
      let postUrl = api + '/api/v1/mine/myInvestDetail/' + param.categoryId + '/' + param.refundStatus + '/' + param.pageNo + '/' + param.pageSize
      let that = this
      util.requestAuto(postUrl).then(res => {
          wx.hideLoading() // 结束loading

          if (res.data.meta.success) { // 请求成功 
            let list = res.data.data.pageObj.list

            if (list.length == 0) {
              that.setData({
                noData: true,
                investStr: that.formatMoney(res.data.data.NowAmount, 2),
                waitIncome: that.formatMoney(res.data.data.ReadyEarnings, 2),
                historyIncome: that.formatMoney(res.data.data.HistoryEarnings, 2)
              })
            } else {
              for (let i = 0; i < list.length; i++) {
                list[i].signAmount = that.formatMoney(list[i].signAmount, 2)
                list[i].valueDate = that.formatTime(list[i].valueDate, 2)
                list[i].dusDays = that.formatTime(list[i].dusDays, 2)
              }
              that.setData({
                dataList: list,
                noData: false,
                investStr: that.formatMoney(res.data.data.NowAmount, 2),
                waitIncome: that.formatMoney(res.data.data.ReadyEarnings, 2),
                historyIncome: that.formatMoney(res.data.data.HistoryEarnings, 2)
              })
            }
            that.setData({ // 结束上拉加载loading
              pullUpLoad: false
            })
          }else {
            console.log('请求失败')
          }
        },rej => {
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
    } else {
      let postUrl = api + '/api/v1/mine/myInvestDetailOther/' + param.categoryId + '/' + param.refundStatus + '/' + param.pageNo + '/' + param.pageSize
      let that = this
      util.requestAuto(postUrl).then(res => {
          wx.hideLoading() // 结束loading
          if (res.data.meta.success) { // 请求成功 
            let list = res.data.data.list
            
            for (let i = 0; i < list.length; i++) {
              list[i].signAmount = that.formatMoney(list[i].signAmount, 2)
              list[i].netValue = list[i].netValue.toFixed(4) 
            }

            that.setData({
              dataList: list,
            })
            if (that.data.dataList.length == 0) {
              that.setData({
                noData: true,
              })
            } else {
              that.setData({
                noData: false,
                investStr: that.formatMoney(list[0].nowAmount, 2),
                allInvestStr: that.formatMoney(list[0].totalSignAmount, 2)
              })
            }
            that.setData({ // 结束上拉加载loading
              pullUpLoad: false
            })
          } else {
            console.log('请求失败')
          }
        },rej => {
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
  toDetailPage(e){ // 进入详情页面
    let id = e.currentTarget.dataset.id
    let investId = e.currentTarget.dataset.ydid
    if (this.data.productType == 1){
      wx.navigateTo({
        url: '../listDetail/listDetail?type=' + this.data.productType + '&id=' + id + '&investId=' + investId + '&refundStatus=' + this.data.refundStatus
      })
    }else{
      wx.navigateTo({
        url: '../listDetail/listDetail?type=' + this.data.productType + '&id=' + id + '&refundStatus=' + this.data.refundStatus
      })
    }
    
  },
  formatMoney: function (money, decNum) {
    let moneyStr = util.formatMoney(money, decNum)
    return moneyStr
  },
  formatTime: function(str) {
    if (str) {
      let time = str.split('-').join('.')
      return time
    } else {
      return;
    }
  }
})
