Page({
  data: {

  },
  onLoad: function () {

  },
  readAgreement: function () {

    // let app = getApp()
    // app.globalData.hasAgree = true
    // wx.navigateBack()

    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      hasAgree: true
    })
    wx.navigateBack()
  }
})
