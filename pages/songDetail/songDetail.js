
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay:false,  //音乐是否在播放
    song:{},  //歌曲详情对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options:用于接收路由跳转的query参数
    //原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    let musicId = options.musicId;
    //获取音乐详情
    this.getMusicInfo(musicId)


  },

  //获取音乐详情的功能函数

  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids:musicId})
    this.setData({
      song:songData.songs[0]
    })
    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title:this.data.song.name
    })

  },

  //点击播放/暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    //修改是否播放状态
    this.setData({
      isPlay
    })

    this.musicControl(isPlay);
  },

  //控制音乐播放/暂停的功能函数
  musicControl(isPlay){
    if(isPlay){  //音乐播放
      //创建控制音乐播放的实例
      
    }else{  //暂停音乐播放

    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})