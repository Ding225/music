import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[],  //导航标签数据
    navId:'',  //导航的标识
    videoList:[],  //视频列表数据
    videoId:'',  //视频id标识
    videoUpdateTime:[] ,  //video播放的时长
    isTriggered:false,  //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航区域
    this.getVideoGroupData();
    
  },

  // 获取导航数据
  async getVideoGroupData(){
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList:videoGroupListData.data.slice(0,14),
      navId:videoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getVideoList(this.data.navId);

  },

  //获取视频列表数据
  async getVideoList(navId){
    if(!navId){   //判断navId为空串的情况
      return;
    }
    let videoListData = await request('/video/group',{id:navId});
    //关闭消息提示框
    wx.hideLoading();
   

    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    
    this.setData({
      videoList,
      isTriggered:false    //关闭下拉刷新   
    })

  },

  //点击切换导航回调
  changeNav(event){
    let navId = event.currentTarget.id;
    this.setData({
      navId,
      videoList:[]
    })
    //显示
    wx.showLoading({
      title:'正在加载'
    })
    // 动态获取当前视频导航对应的视频数据
    this.getVideoList(this.data.navId);
  },

// 点击播放、继续播放的回调
//    问题：多个视屏同时播放的问题
// 需求：1.在点击播放的事件中需要找到上一个播放的视频
//       2.在播放新的视频之前关闭上一个正在播放的视频

// 关键 1.如何找到上一个视频的实例对象
//      2如何确认点击播放的视频和正在播放的视频不是同一个视频.

//  单例模式 1.需要创建多个对象的场景下通过一个变量接收，始终保持只有一个对象
//           2.节省内存空间
handlePlay(event){
  let vid = event.currentTarget.id;
  //关闭上一个播放的视频
//  this.vid !== vid && this.videoContext && this.videoContext.stop();

//  this.vid = vid;

//更新data中videoId的状态数据
this.setData({
  videoId:vid
})

    //创建控制video标签的实例对象
 this.videoContext = wx.createVideoContext(vid );
 //判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转至指定的播放位置
let {videoUpdataTime} = this.data;
let videoItem = videoUpdataTime.find(item => item.vid === vid);
if(videoItem){
  this.videoContext.seek(videoItem.currentTime);
}
 this.videoContext.play();
    // this.videoContext.stop();
},

//监听视屏播放进度的回调
handleTimeUpdate(event){
  let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime};
  let {videoUpdateTime}  = this.data;
  //判断记录播放时长的videoUpdateTime数组，是否有当前视频的播放记录
  //1.如果有，在原有的播放记录中修改播放记录时间为当前的播放时间
  //2.如果没有，需要在数组中添加当前视频播放记录
  let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
  if(videoItem){  //之前有
    videoItem.currentTime = videoTimeObj.currentTime;
  }else{
    videoUpdataTime.push(videoTimeObj);
  };
  //统一更新videoUpdateTime的状态
  this.setData({
    videoUpdateTime
  })
},
//视频播放结束调用的回调
hanleEnded(event){
  //移除记录播放时长数组中当前视频的对象
  let {videoUpdataTime} = this.data;
  videoUpdataTime.splice(videoUpdataTime.findIndex(item => item.vid === event.currentTarget.id),1)
  this.setData({
    videoUpdataTime
  })
},

//自定义下拉刷新的回调   scroll-view
handleRefresher(){
  //再次发请求，获取最新的视频列表数据
  this.getVideoList(this.data.navId)
},
 
// 自定义上啦触底的回调   scroll-view
handleToLower(){
  // 数据分页：1.后端分页   2.前端分页
  //模拟数据
  let newVideoList = [
    {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_DF0062BEF97CC90685C04E21B4DD7788",
          "coverUrl": "https://p1.music.126.net/pONfOgwwjasRuEf7CiZKZg==/109951164478511327.jpg",
          "height": 1080,
          "width": 1920,
          "title": "选手一开口的烟嗓嗨翻全场，结果一看是王嘉尔，林俊杰：骗人",
          "description": "选手一开口的烟嗓嗨翻全场，结果一看是王嘉尔，林俊杰：骗人",
          "commentCount": 315,
          "shareCount": 114,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 22035379
              },
              {
                  "resolution": 480,
                  "size": 37000928
              },
              {
                  "resolution": 720,
                  "size": 53832099
              },
              {
                  "resolution": 1080,
                  "size": 103611349
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 330000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/u8ZsKSHI2476w0cId2gDUg==/109951164204660758.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 330500,
              "birthday": 860860800000,
              "userId": 1735415103,
              "userType": 204,
              "nickname": "盼盼音乐Show",
              "signature": "关注我每日更新热歌",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951164204660750,
              "backgroundImgId": 109951162868126480,
              "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                  "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951164204660758",
              "backgroundImgIdStr": "109951162868126486"
          },
          "urlInfo": {
              "id": "DF0062BEF97CC90685C04E21B4DD7788",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/yhHrBAGM_2781478238_uhd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=fqUOIdNHBoFRPsWdojtVwNylsNOYRqee&sign=83963e8c00558a9f684a00ee535d3913&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 103611349,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 11110,
                  "name": "林俊杰",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              },
              {
                  "id": 4101,
                  "name": "娱乐",
                  "alg": null
              },
              {
                  "id": 3101,
                  "name": "综艺",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "DF0062BEF97CC90685C04E21B4DD7788",
          "durationms": 191552,
          "playTime": 2296852,
          "praisedCount": 8177,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_59C09B29C2AEB0D3EC31D1FDD7E9404B",
          "coverUrl": "https://p1.music.126.net/H-gGzXoSCWzMGl7sBVMz4A==/109951163376317437.jpg",
          "height": 720,
          "width": 1280,
          "title": "巅峰期的“浪子”嗓子太好了，一首《谁明浪子心》超好听",
          "description": "巅峰时期的“浪子”嗓子太好了，王杰一首《谁明浪子心》唱得比CD还好听！",
          "commentCount": 504,
          "shareCount": 824,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 21773554
              },
              {
                  "resolution": 480,
                  "size": 35599112
              },
              {
                  "resolution": 720,
                  "size": 50410196
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 340000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/C6VID_CReqmt8ETsUWaYTQ==/18499283139231828.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 340100,
              "birthday": -2209017600000,
              "userId": 479954154,
              "userType": 207,
              "nickname": "音乐诊疗室",
              "signature": "当我坐在那架破旧古钢琴旁边的时候，我对最幸福的国王也不羡慕。（合作推广请私信，或者+V信：mjs927721）",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 18499283139231828,
              "backgroundImgId": 1364493978647983,
              "backgroundUrl": "http://p1.music.126.net/i4J_uvH-pb4sYMsh4fgQAA==/1364493978647983.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                  "1": "音乐视频达人",
                  "2": "音乐资讯达人"
              },
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "18499283139231828",
              "backgroundImgIdStr": "1364493978647983"
          },
          "urlInfo": {
              "id": "59C09B29C2AEB0D3EC31D1FDD7E9404B",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/8x3Hqg3U_1720419473_shd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=jBuWBCAJyJpSUZEDVblYcBydcUCAwnmg&sign=ec96ecd1e933497bf91824e2d37c8530&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 50410196,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 57105,
                  "name": "粤语现场",
                  "alg": null
              },
              {
                  "id": 57108,
                  "name": "流行现场",
                  "alg": null
              },
              {
                  "id": 59108,
                  "name": "巡演现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
              108
          ],
          "relateSong": [
              {
                  "name": "谁明浪子心",
                  "id": 158655,
                  "pst": 0,
                  "t": 0,
                  "ar": [
                      {
                          "id": 5358,
                          "name": "王杰",
                          "tns": [],
                          "alias": []
                      }
                  ],
                  "alia": [
                      "电视剧《还我本色》主题曲"
                  ],
                  "pop": 100,
                  "st": 0,
                  "rt": "600902000005325662",
                  "fee": 1,
                  "v": 35,
                  "crbt": null,
                  "cf": "",
                  "al": {
                      "id": 15941,
                      "name": "谁明浪子心",
                      "picUrl": "http://p4.music.126.net/hEu6E1sN_nT3YfiV0UAvhw==/109951163023779355.jpg",
                      "tns": [],
                      "pic_str": "109951163023779355",
                      "pic": 109951163023779360
                  },
                  "dt": 304227,
                  "h": {
                      "br": 320000,
                      "fid": 0,
                      "size": 12172060,
                      "vd": 19912
                  },
                  "m": {
                      "br": 192000,
                      "fid": 0,
                      "size": 7303253,
                      "vd": 22498
                  },
                  "l": {
                      "br": 128000,
                      "fid": 0,
                      "size": 4868850,
                      "vd": 24219
                  },
                  "a": null,
                  "cd": "1",
                  "no": 1,
                  "rtUrl": null,
                  "ftype": 0,
                  "rtUrls": [],
                  "djId": 0,
                  "copyright": 1,
                  "s_id": 0,
                  "rtype": 0,
                  "rurl": null,
                  "mst": 9,
                  "cp": 7002,
                  "mv": 0,
                  "publishTime": 623174400000,
                  "privilege": {
                      "id": 158655,
                      "fee": 1,
                      "payed": 0,
                      "st": 0,
                      "pl": 0,
                      "dl": 0,
                      "sp": 0,
                      "cp": 0,
                      "subp": 0,
                      "cs": false,
                      "maxbr": 999000,
                      "fl": 0,
                      "toast": false,
                      "flag": 4,
                      "preSell": false
                  }
              }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "59C09B29C2AEB0D3EC31D1FDD7E9404B",
          "durationms": 295702,
          "playTime": 613087,
          "praisedCount": 3352,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_877469E880320B21A5FEBE073C8D6266",
          "coverUrl": "https://p1.music.126.net/1oWrasoRfEE8UdM6Ta58SA==/109951164142024489.jpg",
          "height": 720,
          "width": 1280,
          "title": "林俊杰 - 起风了(2019林俊杰圣所2.0世界巡回演唱会青岛站)",
          "description": "林俊杰 - 起风了(2019林俊杰圣所2.0世界巡回演唱会青岛站)",
          "commentCount": 291,
          "shareCount": 690,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 33536942
              },
              {
                  "resolution": 480,
                  "size": 56789416
              },
              {
                  "resolution": 720,
                  "size": 88584671
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 350000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/jZkIVDxOOKdNQe45G-H-ng==/109951163063703622.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 350100,
              "birthday": -1546934400000,
              "userId": 439384079,
              "userType": 204,
              "nickname": "肥嘟嘟卓卫门",
              "signature": "还有三千人没会，还有三千事不会",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163063703620,
              "backgroundImgId": 109951164114830290,
              "backgroundUrl": "http://p1.music.126.net/f2MYjLsqTvwTXOXg-dRl-g==/109951164114830287.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                  "1": "音乐视频达人"
              },
              "djStatus": 0,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163063703622",
              "backgroundImgIdStr": "109951164114830287"
          },
          "urlInfo": {
              "id": "877469E880320B21A5FEBE073C8D6266",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FF8ffhEh_2544829623_shd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=qfrUfYKnrjZUUCdXrYZRaOiGLtYGKuYP&sign=3697275470550692734f34253fd13a42&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 88584671,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 9102,
                  "name": "演唱会",
                  "alg": null
              },
              {
                  "id": 59101,
                  "name": "华语现场",
                  "alg": null
              },
              {
                  "id": 57108,
                  "name": "流行现场",
                  "alg": null
              },
              {
                  "id": 59108,
                  "name": "巡演现场",
                  "alg": null
              },
              {
                  "id": 11110,
                  "name": "林俊杰",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "877469E880320B21A5FEBE073C8D6266",
          "durationms": 315691,
          "playTime": 292531,
          "praisedCount": 4738,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_4BBC3556A3FFE18C9C44ED741AE34F1E",
          "coverUrl": "https://p1.music.126.net/15ZbhG8a_NLvUt25COTkhA==/109951164427264034.jpg",
          "height": 540,
          "width": 960,
          "title": "【Live】谭维维翻唱《晚婚》，着迷的让人想哭！",
          "description": "头披婚纱，我从来不想独身，却有预感晚婚，我在等，世上唯一契合灵魂。",
          "commentCount": 702,
          "shareCount": 10750,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 24624377
              },
              {
                  "resolution": 480,
                  "size": 38987747
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 610000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/u_NVy9HkeS16yZEyOs5k7w==/2945591652922899.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 610100,
              "birthday": 749720327000,
              "userId": 18419219,
              "userType": 0,
              "nickname": "流浪的玉米粒儿",
              "signature": "我蹲在这里不走 等你找到我好不好",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 2945591652922899,
              "backgroundImgId": 109951166631491280,
              "backgroundUrl": "http://p1.music.126.net/8yaKtHINhwpRQ99AokbAGw==/109951166631491282.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "2945591652922899",
              "backgroundImgIdStr": "109951166631491282"
          },
          "urlInfo": {
              "id": "4BBC3556A3FFE18C9C44ED741AE34F1E",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/iI9A0cuh_2617143896_hd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=pIjjSSmKlVALfHUuCHewxkGufvhjEgWe&sign=ccc008e1e31dd009eae96b520c22d837&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 38987747,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 480
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              },
              {
                  "id": 4101,
                  "name": "娱乐",
                  "alg": null
              },
              {
                  "id": 3101,
                  "name": "综艺",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "4BBC3556A3FFE18C9C44ED741AE34F1E",
          "durationms": 291562,
          "playTime": 1871632,
          "praisedCount": 13662,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8986450C78BE18A74D40D1A60FD17E56",
          "coverUrl": "https://p1.music.126.net/nvqyefMP4YNBZxs0uy17Mw==/109951164139751255.jpg",
          "height": 1080,
          "width": 1920,
          "title": "Bodyrockers- I Like the Way",
          "description": "",
          "commentCount": 25,
          "shareCount": 78,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 33331219
              },
              {
                  "resolution": 480,
                  "size": 58608871
              },
              {
                  "resolution": 720,
                  "size": 90382235
              },
              {
                  "resolution": 1080,
                  "size": 166148903
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 350000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/BIQ5P2L3gaTpRj4C3UiAwg==/109951163390988538.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 350200,
              "birthday": -2209017600000,
              "userId": 104962551,
              "userType": 207,
              "nickname": "三步一颠",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163390988540,
              "backgroundImgId": 2002210674180198,
              "backgroundUrl": "http://p1.music.126.net/i0qi6mibX8gq2SaLF1bYbA==/2002210674180198.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951163390988538",
              "backgroundImgIdStr": "2002210674180198"
          },
          "urlInfo": {
              "id": "8986450C78BE18A74D40D1A60FD17E56",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/2Fe352HS_2543333469_uhd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=RNEuMaKxTkpMKYNUaETxqAaejMJyofcH&sign=f642c2afd18c2f2449b3835acbbbbc6b&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 166148903,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 58101,
                  "name": "听BGM",
                  "alg": null
              },
              {
                  "id": 2100,
                  "name": "生活",
                  "alg": null
              },
              {
                  "id": 57106,
                  "name": "欧美现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              },
              {
                  "id": 16226,
                  "name": "美女",
                  "alg": null
              },
              {
                  "id": 74105,
                  "name": "vlog",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
              {
                  "name": "I Like The Way",
                  "id": 24063034,
                  "pst": 0,
                  "t": 0,
                  "ar": [
                      {
                          "id": 29727,
                          "name": "Bodyrockers",
                          "tns": [],
                          "alias": []
                      }
                  ],
                  "alia": [],
                  "pop": 45,
                  "st": 0,
                  "rt": "600902000005171627",
                  "fee": 8,
                  "v": 140,
                  "crbt": null,
                  "cf": "",
                  "al": {
                      "id": 2163007,
                      "name": "Now That's What I Call A Wedding",
                      "picUrl": "http://p4.music.126.net/B5ft-khdc1zVrLJLFsZ9wg==/886206372017084.jpg",
                      "tns": [],
                      "pic": 886206372017084
                  },
                  "dt": 200000,
                  "h": {
                      "br": 320000,
                      "fid": 0,
                      "size": 8037548,
                      "vd": -16900
                  },
                  "m": {
                      "br": 192000,
                      "fid": 0,
                      "size": 4822606,
                      "vd": -14400
                  },
                  "l": {
                      "br": 128000,
                      "fid": 0,
                      "size": 3215135,
                      "vd": -13099
                  },
                  "a": null,
                  "cd": "1",
                  "no": 48,
                  "rtUrl": null,
                  "ftype": 0,
                  "rtUrls": [],
                  "djId": 0,
                  "copyright": 1,
                  "s_id": 0,
                  "rtype": 0,
                  "rurl": null,
                  "mst": 9,
                  "cp": 7003,
                  "mv": 0,
                  "publishTime": 1303056000007,
                  "privilege": {
                      "id": 24063034,
                      "fee": 8,
                      "payed": 0,
                      "st": 0,
                      "pl": 128000,
                      "dl": 0,
                      "sp": 7,
                      "cp": 1,
                      "subp": 1,
                      "cs": false,
                      "maxbr": 320000,
                      "fl": 128000,
                      "toast": false,
                      "flag": 260,
                      "preSell": false
                  }
              }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8986450C78BE18A74D40D1A60FD17E56",
          "durationms": 134141,
          "playTime": 82217,
          "praisedCount": 381,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_F197C20D9682A89A06AFBF1DACDBAD04",
          "coverUrl": "https://p1.music.126.net/xWx6cVmiOkXolxWKL2pyMw==/109951163687653297.jpg",
          "height": 1080,
          "width": 1920,
          "title": "【Hyuna Freaky】俏皮性感也可爱，散发马儿你不想看吗？",
          "description": "超性感马儿在这里哦~~~",
          "commentCount": 103,
          "shareCount": 233,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 21148734
              },
              {
                  "resolution": 480,
                  "size": 36593221
              },
              {
                  "resolution": 720,
                  "size": 55423347
              },
              {
                  "resolution": 1080,
                  "size": 89358556
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 310000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/yXvdQqpyvE59vtVtH752kQ==/109951163608415917.jpg",
              "accountStatus": 0,
              "gender": 2,
              "city": 310101,
              "birthday": 820425600000,
              "userId": 1643494142,
              "userType": 204,
              "nickname": "变色美少女",
              "signature": "沉迷KPOP的美色和音色！B站/微博：变色美少女",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951163608415920,
              "backgroundImgId": 109951164108485980,
              "backgroundUrl": "http://p1.music.126.net/VU3lUAqGjqOihQjTgcNKgw==/109951164108485982.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                  "1": "音乐视频达人"
              },
              "djStatus": 10,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951163608415917",
              "backgroundImgIdStr": "109951164108485982"
          },
          "urlInfo": {
              "id": "F197C20D9682A89A06AFBF1DACDBAD04",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/QMTb41PF_2146272634_uhd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=nGyXxIUJhHrZENKbrDZMvkTwKHNoFHIS&sign=2e55f43451d4a7488f58a2bca6f57ada&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 89358556,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 1080
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 1101,
                  "name": "舞蹈",
                  "alg": null
              },
              {
                  "id": 9102,
                  "name": "演唱会",
                  "alg": null
              },
              {
                  "id": 57107,
                  "name": "韩语现场",
                  "alg": null
              },
              {
                  "id": 57108,
                  "name": "流行现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              },
              {
                  "id": 218120,
                  "name": "金泫雅",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "F197C20D9682A89A06AFBF1DACDBAD04",
          "durationms": 91477,
          "playTime": 446010,
          "praisedCount": 2603,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_BADB69C523F5A5762C7183A0471DC279",
          "coverUrl": "https://p1.music.126.net/Ne1H715FuIPlgyqB2fDI2Q==/109951163707642944.jpg",
          "height": 720,
          "width": 1280,
          "title": "唱功太了不起了！！",
          "description": "",
          "commentCount": 514,
          "shareCount": 1398,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 12748310
              },
              {
                  "resolution": 480,
                  "size": 22188825
              },
              {
                  "resolution": 720,
                  "size": 31041154
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 510000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/SUeqMM8HOIpHv9Nhl9qt9w==/109951165647004069.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 510100,
              "birthday": -2209017600000,
              "userId": 1676816624,
              "userType": 0,
              "nickname": "聆听往事如风",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951165647004060,
              "backgroundImgId": 109951162868126480,
              "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": null,
              "djStatus": 0,
              "vipType": 0,
              "remarkName": null,
              "avatarImgIdStr": "109951165647004069",
              "backgroundImgIdStr": "109951162868126486"
          },
          "urlInfo": {
              "id": "BADB69C523F5A5762C7183A0471DC279",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/jPEm3xm5_2168770943_shd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=OjnCjqcgACUrCPsNkdsoKHdyqMeMJZLn&sign=bb4c06e42c10417da09186793092703f&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 31041154,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              },
              {
                  "id": 4101,
                  "name": "娱乐",
                  "alg": null
              },
              {
                  "id": 3101,
                  "name": "综艺",
                  "alg": null
              },
              {
                  "id": 75122,
                  "name": "欧美综艺",
                  "alg": null
              },
              {
                  "id": 94106,
                  "name": "选秀节目",
                  "alg": null
              },
              {
                  "id": 76108,
                  "name": "综艺片段",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
              {
                  "name": "Who's Loving You",
                  "id": 4338174,
                  "pst": 0,
                  "t": 0,
                  "ar": [
                      {
                          "id": 129526,
                          "name": "Jackson 5",
                          "tns": [],
                          "alias": []
                      }
                  ],
                  "alia": [],
                  "pop": 20,
                  "st": 0,
                  "rt": "600902000005244277",
                  "fee": 1,
                  "v": 14,
                  "crbt": null,
                  "cf": "",
                  "al": {
                      "id": 438089,
                      "name": "Gold",
                      "picUrl": "http://p4.music.126.net/38ZhU37XmTaLV0J5_ZdGoA==/903798558080750.jpg",
                      "tns": [],
                      "pic": 903798558080750
                  },
                  "dt": 240533,
                  "h": {
                      "br": 320000,
                      "fid": 0,
                      "size": 9623554,
                      "vd": -77123
                  },
                  "m": {
                      "br": 192000,
                      "fid": 0,
                      "size": 5774150,
                      "vd": -74592
                  },
                  "l": {
                      "br": 128000,
                      "fid": 0,
                      "size": 3849448,
                      "vd": -72655
                  },
                  "a": null,
                  "cd": "1",
                  "no": 2,
                  "rtUrl": null,
                  "ftype": 0,
                  "rtUrls": [],
                  "djId": 0,
                  "copyright": 1,
                  "s_id": 0,
                  "rtype": 0,
                  "rurl": null,
                  "mst": 9,
                  "cp": 7003,
                  "mv": 14306006,
                  "publishTime": 1109606400007,
                  "privilege": {
                      "id": 4338174,
                      "fee": 1,
                      "payed": 0,
                      "st": 0,
                      "pl": 0,
                      "dl": 0,
                      "sp": 0,
                      "cp": 0,
                      "subp": 0,
                      "cs": false,
                      "maxbr": 999000,
                      "fl": 0,
                      "toast": false,
                      "flag": 260,
                      "preSell": false
                  }
              }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "BADB69C523F5A5762C7183A0471DC279",
          "durationms": 130239,
          "playTime": 2155459,
          "praisedCount": 8596,
          "praised": false,
          "subscribed": false
      }
  },
  {
      "type": 1,
      "displayed": false,
      "alg": "onlineHotGroup",
      "extAlg": null,
      "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_3A108268EE9D439315701CDBAE92F1EA",
          "coverUrl": "https://p1.music.126.net/rZ6Kcy3TXbrMoJid8OVA7Q==/109951163574224009.jpg",
          "height": 720,
          "width": 1280,
          "title": "刘德华催泪现场！天王再现经典《17岁》真的很扎心！",
          "description": "刘德华催泪现场！天王再现经典《17岁》真的很扎心！",
          "commentCount": 1624,
          "shareCount": 10967,
          "resolutions": [
              {
                  "resolution": 240,
                  "size": 26442677
              },
              {
                  "resolution": 480,
                  "size": 44077613
              },
              {
                  "resolution": 720,
                  "size": 62574761
              }
          ],
          "creator": {
              "defaultAvatar": false,
              "province": 340000,
              "authStatus": 0,
              "followed": false,
              "avatarUrl": "http://p1.music.126.net/OqEkaKwFoV2XgsddPGfcow==/109951165474023172.jpg",
              "accountStatus": 0,
              "gender": 0,
              "city": 340100,
              "birthday": 631123200000,
              "userId": 415197557,
              "userType": 207,
              "nickname": "全球音乐吧",
              "signature": "",
              "description": "",
              "detailDescription": "",
              "avatarImgId": 109951165474023170,
              "backgroundImgId": 109951166223106900,
              "backgroundUrl": "http://p1.music.126.net/p1stKDNMdYwRKoEtTcQogQ==/109951166223106890.jpg",
              "authority": 0,
              "mutual": false,
              "expertTags": null,
              "experts": {
                  "1": "音乐视频达人",
                  "2": "欧美音乐资讯达人"
              },
              "djStatus": 10,
              "vipType": 11,
              "remarkName": null,
              "avatarImgIdStr": "109951165474023172",
              "backgroundImgIdStr": "109951166223106890"
          },
          "urlInfo": {
              "id": "3A108268EE9D439315701CDBAE92F1EA",
              "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/9ag7TJEV_1907759265_shd.mp4?ts=1646816667&rid=C7DFC9741674BD33FEE0A373AE2BD643&rl=3&rs=PcaZNixNWsxECAzhiMLJAPGQEWQnbMrc&sign=8c91e215b9f803736b44fcc5acf87f18&ext=CwvXy2ULRzfKhDw3gx5ITSiBgkMfNbQvYu6Pp22745L5HIIrT6h4WwDf90079Pk%2BFH8rJdG9wzcVcaFCsNdFLe3sYtG%2Fj26lwaibxQY0J6qPMY1L3eb9oEJwR2em3yNFrgZZYpwc0bXkiCUyUeTsFFpJJ%2FVbfSs8D46Nb2o1ieLVQWyDhtUKc3P3NyjCLHgL6n0mUxVjW6febfCtsuv%2Bq6G%2FThKEywY9p%2Fn5xtWjllZ8e1hObpa3JZCn%2Flw%2F629f",
              "size": 62574761,
              "validityTime": 1200,
              "needPay": false,
              "payInfo": null,
              "r": 720
          },
          "videoGroup": [
              {
                  "id": 58100,
                  "name": "现场",
                  "alg": null
              },
              {
                  "id": 57105,
                  "name": "粤语现场",
                  "alg": null
              },
              {
                  "id": 57108,
                  "name": "流行现场",
                  "alg": null
              },
              {
                  "id": 59108,
                  "name": "巡演现场",
                  "alg": null
              },
              {
                  "id": 1100,
                  "name": "音乐现场",
                  "alg": null
              },
              {
                  "id": 5100,
                  "name": "音乐",
                  "alg": null
              }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
              101,
              111
          ],
          "relateSong": [
              {
                  "name": "17岁 (Live)",
                  "id": 29723041,
                  "pst": 0,
                  "t": 0,
                  "ar": [
                      {
                          "id": 3691,
                          "name": "刘德华",
                          "tns": [],
                          "alias": []
                      }
                  ],
                  "alia": [],
                  "pop": 100,
                  "st": 0,
                  "rt": null,
                  "fee": 0,
                  "v": 8,
                  "crbt": null,
                  "cf": "",
                  "al": {
                      "id": 3066282,
                      "name": "Wonderful World 香港演唱会 2007",
                      "picUrl": "http://p3.music.126.net/SqEjzkbOeTocASevCOQ5Sw==/109951165909154050.jpg",
                      "tns": [],
                      "pic_str": "109951165909154050",
                      "pic": 109951165909154050
                  },
                  "dt": 303000,
                  "h": {
                      "br": 320000,
                      "fid": 0,
                      "size": 12142802,
                      "vd": -2
                  },
                  "m": {
                      "br": 192000,
                      "fid": 0,
                      "size": 7285698,
                      "vd": 654
                  },
                  "l": {
                      "br": 128000,
                      "fid": 0,
                      "size": 4857146,
                      "vd": 0
                  },
                  "a": null,
                  "cd": "2",
                  "no": 13,
                  "rtUrl": null,
                  "ftype": 0,
                  "rtUrls": [],
                  "djId": 0,
                  "copyright": 2,
                  "s_id": 0,
                  "rtype": 0,
                  "rurl": null,
                  "mst": 9,
                  "cp": 0,
                  "mv": 0,
                  "publishTime": 1201795200007,
                  "privilege": {
                      "id": 29723041,
                      "fee": 0,
                      "payed": 0,
                      "st": 0,
                      "pl": 320000,
                      "dl": 320000,
                      "sp": 7,
                      "cp": 1,
                      "subp": 1,
                      "cs": false,
                      "maxbr": 320000,
                      "fl": 320000,
                      "toast": false,
                      "flag": 128,
                      "preSell": false
                  }
              }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "3A108268EE9D439315701CDBAE92F1EA",
          "durationms": 269956,
          "playTime": 4210663,
          "praisedCount": 36645,
          "praised": false,
          "subscribed": false
      }
  }
];
  let videoList = this.data.videoList;
  //将视频最新的数据更新原有视频列表数据中
  videoList.push(...newVideoList);
  this.setData({
    videoList
  })
  
},
//跳转搜索界面
toSearch(){
    wx.navigateTo({
        url:'/pages/search/search'
    })
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
  onShareAppMessage: function ({from}) {
    if(from === 'button'){
      return{
        title:'来自button的转发',
        page:'/pages/video/video',
        imageUrl:'/static/images/nvsheng.jpg'
  
      }
    }else{
      return{
        title:'来自menu的转发',
        page:'/pages/video/video',
        imageUrl:'/static/images/nvsheng.jpg'
  
      }
    }
    
  }
})