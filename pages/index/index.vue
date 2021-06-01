<template>
	<view class="main">  
	<van-notify id="van-notify" />
		<view class="titlemessage">
			<van-tag class="titlemessageone" size="large" type="danger">堂食点餐</van-tag>
			<van-notice-bar
			  class="titlemessagetwo"
			  color="#ffffff"
			  background="#ff0000"
			  speed="40"
			  text="加入会员享受优惠折扣,消费还可以拿积分,积分达到一定上限升级会员,更高级会员优惠等你来探索"
			/>
			<!-- <van-tag class="titlemessagetwo" size="large" type="danger">点餐</van-tag> -->
		</view>
		
		<view class="title">
			  <van-tag type="danger">{{tableInfo.name}} </van-tag> 欢迎光临，怡品香餐厅，扫码自助点餐更方便! <van-button type="warning" size="mini" @click="callStaff">呼叫服务员</van-button>
		</view> 
		<!-- 横线 -->
		<van-divider/>
		
	<van-tabs type="card" :active="tabsActive">
		<!-- 点餐tab -->
	  <van-tab title="点餐">
		  <van-row class="toprow">
		  	<!-- 左侧分类栏 -->
		    <van-col span="6" class="leftcol">
		  	  <scroll-view class="leftscroll" :style="{height:windowHeight-(0.2*windowHeight)+'px'}" scroll-y="true" scroll-with-animation="true">
		  		  <van-sidebar :active-key="activeKey" @change="onChange" class="leftsidebar">
		  			<van-sidebar-item v-for="item of tabsList" :key="item.category_id" :title="item.name" :badge="item.badge"/>
		  		  </van-sidebar>
		  	  </scroll-view>
		    </van-col>
		    <!-- 右侧商品滚动栏 -->
		    <van-col span="18" class="rightcol">
		  	  <scroll-view class="rightscroll" :style="{height:windowHeight-(0.2*windowHeight)+'px'}" scroll-y="true" 
		  				   scroll-with-animation="true" enable-back-to-top="true"
		  				   :scroll-into-view="toView"
		  				   @scroll="rightScroll">
		  		  <!-- 视图区 -->
		  		  <view v-for="(tabs,index) in tabsList" :key = "index">
		  			<view class="header" :id="'id'+tabs.category_id">{{tabs.name}}</view>
		  		  	<van-card
		  			ref="goodsCardRef"
		  			v-for="item in tabs.goods_list"
		  			:key="item.goods_id"
		  			:num="item.number ? item.number : ''"
		  			:price="item.price + '/'+item.unit"
		  			:desc="item.description"
		  			:title="item.name"
		  			:thumb="item.img">
		  				<view slot="footer">
		  				  <van-button custom-style="width: 32px !important;height: 32px !important;border-radius: 50% !important;" v-if="item.number ? true : false" round icon="minus" plain @click="decrement(item)"/>
		  				  <van-button  custom-style="width: 32px !important;height: 32px !important;border-radius: 50% !important;" round icon="plus" type="primary" @click="increment(item)"/>
		  				</view>
		  			</van-card>
		  		  				
		  		  </view>
		  				   
		  	  </scroll-view>
		    </van-col>
		  </van-row>
	  </van-tab>
	  <!-- 订单tab -->
	  <van-tab title="订单">
		  <!-- 订单列表 -->
		  <uni-card>
		  			 <view style="font-weight: 900;">订单号:{{order_id}}</view>
		  				    <scroll-view style="height: 20vh;" scroll-with-animation="true" scroll-y="true">
		  						<van-cell v-for="(item,index) in orderDetail" :key="index" :title="item.name + '       ×'+item.number" :value="'¥'+item.price" />
		  				    </scroll-view>
					  <view style="font-weight: 400;display: flex;justify-content: space-between">
						 <view>共{{orderDetailNumber}}件</view>
						 <view>小计:{{orderDetailTotal.toFixed(2)}}</view>
						  
					  </view>
		  </uni-card>
	  </van-tab>
	</van-tabs>
	
	

	<!-- 购物车弹出框 -->
	<van-popup
	
	  round
	  :show="popupShow"
	  position="bottom"
	  custom-style="height: 80%;padding-bottom:20%"
	  duration="800"
	  @close="onClose">
	  
	  <view class="cat_bottom1_view">
	      <view style="margin-left: 30rpx;">已选商品</view>
	      <view style="margin-right: 30rpx;display: flex;" @click="clearCar"><van-icon name="delete-o" size="13px"/>清空购物车</view>
	  </view>
	  
	  
	  <!-- 购物车卡片(包含用户选择的所有商品信息) -->
	  <scroll-view 
	  scroll-with-animation="true"
	  scroll-y="true"
	  style="height: 90%;">
		  <van-card
		  v-for="(item,index) in goods_cat" :key="index"
		  :num="item.number"
		  :price="(item.price*item.number).toFixed(2)"
		  :desc="'单价：'+item.price"
		  :title="item.name"
		  :thumb="item.img">
			<view slot="footer" class="btn_group">
			  <van-button custom-style="width: 32px !important;height: 32px !important;border-radius: 50% !important;" v-if="item.number ? true : false"  slot="footer" round icon="minus" plain @click="cat_decrement(item,index)"/>
			  <van-button custom-style="width: 32px !important;height: 32px !important;border-radius: 50% !important;" slot="footer" round icon="plus" type="primary" @click="cat_increment(item)"/>
			</view>
		  </van-card>
	  </scroll-view>
	</van-popup>
	<!-- 购物车栏 -->
	<van-row >
		<van-col span="24">
			<van-submit-bar
			  :price="(price).toFixed(2)*100"
			  button-text="提交订单"
			  @submit="onSubmit"
			>
			<view class="cat_img_view">
			   <van-image
			     round
			     width="3rem"
			     height="3rem"
			     class="cat_img"
			     src="../../../static/images/shop-cat-on1.png"
				 @click="isShowCat"
				 use-loading-slot>
				  <van-loading slot="loading" type="spinner" size="20" vertical />
			   </van-image>
			<!-- 商品总数量 -->
			    <view class="cat_num" v-if="cat_num > 0">		
					{{cat_num}}
			    </view>
			</view>
			<!-- <view slot="tip" style="{text-align: center}" v-if="!popupShow">满28减5、满38减11、满48减14、满66减20</view> -->
			</van-submit-bar>
		</van-col>
	</van-row>
	
	<!-- 下单 -->
	<van-popup @close="onOrderPopupClose" round :show="orderPopupShow" close-on-click-overlay custom-style="height: 75%;width : 95%;background-color: rgb(244,243,244)">
    
	<view style="height: 100%;width:100%;display: flex;flex-flow: column;justify-content: space-between">
		<!-- 顶部信息 -->
		<view style="background-color: #FFFFFF;padding-bottom: 5px;">
			 <van-row>
					  <van-col span="24" style="color: rgb(250,197,72); font-weight: 900;text-align: center;">请确认订单</van-col>
			 </van-row>
			 <van-row style="text-align: center;display: flex; align-items: center;justify-content: center; margin-top: 20upx;">
					<van-col style="color: rgb(250,197,72);font-weight: 900;">
						用餐人数:
					</van-col>
					<!-- 就餐人数numberSelector -->
					<van-col>
						<van-stepper style="" :value="peopleNum" min="1" :max="tableInfo.galleryful"  input-width="60%" button-size="32px" integer/> (不超过<van-tag round type="success">{{tableInfo.galleryful}}</van-tag>人)
					</van-col>
			 </van-row>
		 </view>
				<!-- 订单列表 -->
		 <uni-card>
			 <view style="color: rgb(250,197,72);font-weight: 900;">本次添加:</view>
				    <scroll-view style="height: 20vh;" scroll-with-animation="true" scroll-y="true">
						<van-cell v-for="(item,index) in goods_cat" :key="index" :title="item.name + '       ×'+item.number" :value="'¥'+item.price" />
				    </scroll-view>
		 </uni-card>
		 
		 <uni-card style="height: 300rpx;">
		 		  <van-field
		 		     :value="remark"
		 		     label="备注:"
		 		     type="textarea"
					 focus="true"
					 label-class="lableClass"
					 :autosize="{maxHeight: 50, minHeight: 20}"
		 		     placeholder="请输入备注"
		 		     border="false"
		 		   />
		 </uni-card>
		
		 <van-row style="margin-bottom: 0rpx;">
		   <van-col span="12"><van-button block style="padding-bottom: 0px;" @click="onOrderPopupClose">取消</van-button></van-col>
		   <van-col span="12"><van-button block type="danger" @click="submitOrder">确定</van-button></van-col>
		</van-row>
	</view>

	</van-popup>
<!-- <van-dialog
  use-slot
  title="提交订单"
  :show="orderPopupShow"
  show-cancel-button
  confirm-button-open-type="getUserInfo"
>
 <van-row>
        用餐人数:(本餐桌最大不超过<van-tag round type="success">{{tableInfo.galleryful}}</van-tag>人)
        <van-stepper :value="peopleNum" min="1" :max="tableInfo.galleryful"  input-width="40px" button-size="32px" integer/> 
      </van-row>
</van-dialog> -->

	 
	</view>
</template>

<script>
	import Notify from '../../wxcomponents/vant/notify/notify';
	let that = null;
	import io from '@/js_sdk/hyoga-uni-socket_io/uni-socket.io';
	const socket = io('http://localhost:8080', {
					  query: {},
					  transports: [ 'websocket', 'polling' ],
					  timeout: 5000,
					});
	socket.on('connect', () => {
	  // ws连接已建立，此时可以进行socket.io的事件监听或者数据发送操作
	  console.log('连接上了');
	  // socket.io 唯一连接id，可以监控这个id实现点对点通讯
	  // const { id } = socket;
	  
	  // socket.on(id, (message) => {
	  //   // 收到服务器推送的消息，可以跟进自身业务进行操作
	  //   console.log('ws 收到服务器消息：', message);
	  // });
	
	  // // 主动向服务器发送数据
	  // socket.emit('sendMsg', {
	  //   newAccount: 'xxxxxx'
	  // });
	  
	});
	socket.on('allmessage', function (data) {
		   // 接收所有人消息
		console.log(data);

	})  
	export default {
		data() {
			return {
				windowWidth:0,
				windowHeight:0,
				table_id:'',// 餐桌号
				tableInfo:{},
				activeKey:0,// 左侧活动key 
				tabsList:[],// 分类列表
				toView:'',// 点击分类项时给右边菜品列表标题名的锚点   scroll-view中scroll-into-view的属性值
				rightScrollTop:'',//右侧自动划到的id
				rightTopArray:[],//右侧条目的顶部值
				mainActiveIndex:[],//---------------未使用-----------
				activeId:'',//---------------未使用------------
				badge:0,    //红点菜品个数
				goodsInfo:[],   //商品信息---未使用--------
				price:0,   //提交价格,
				goods_cat:[],  ////购物车内容
				popupShow:false, //购物车弹出层标志
				cat_num:0,		//购物车总数量
				orderPopupShow:false,//下单弹出标志,
				peopleNum:1,		//用餐人数
				remark:'',
				order_id:'',
				tabsActive:0,
				isSubmit:false,
				orderDetail:[], //查询出的订单详情(注意和购物车区别)
				orderDetailTotal:0,
				orderDetailNumber:0
			}
		},
		methods: {
			async getTabsList(){
					await this.$myRequest({
						 url:"/orders/getCategory"
					 }).then(res => { 
						 this.tabsList = res.data;
						 this.getGoodsList();
						 this.goodsCount();
					 })
			    },
			getGoodsList() {
				this.tabsList.forEach((currentValue, index) =>{
				this.$myRequest({
						 url:"/goods/queryGoodsByName",
						 data:{ category: this.tabsList[index].name}
					 }).then(res => { 
						 this.tabsList[index].goods_list = res.data;
						 this.$forceUpdate();
						})
					 })
			},
			// 获取指定分类商品的数量
			goodsCount() {
				 this.tabsList.forEach((currentValue, index) =>{
				 this.$myRequest({
						 url:"/goods/goodsCount",
						 data:{ category: this.tabsList[index].name}
					 }).then(res => {
						 // this.badge = res.data[0].goodsCount;
						 this.tabsList[index].badge = res.data[0].goodsCount;
						 this.$forceUpdate();
					 })
				 })
			},
			// 左侧点击事件
			onChange(event){
				this.activeKey = event.detail;
				
				console.log(this.activeKey);
				this.toView ='id'+this.tabsList[this.activeKey].category_id
			},
			// 右侧滚动事件 
			rightScroll(event){
				that.rightScrollTop=event.detail.scrollTop;
				
				const length = this.rightTopArray.length;
				for(let i = 0; i < length; i++){
					// 如果当前滑动的距离大于等于当前索引为i的条目的top,并且小于索引为i+1的条目的top
					let scrollTop = that.rightScrollTop;
					let topOne = that.rightTopArray[0];
					let top = that.rightTopArray[i];
					if(i<length-1){
						let topNext = that.rightTopArray[i+1]  //取得下一个高度
						if(scrollTop >= top-topOne && scrollTop < topNext-topOne){
							if(that.activeKey != i){  //活动节点不等于当前i索引
								that.activeKey = i		//将左侧活动索引切换到滚动到的索引
							}
						} 
					}
					if(i == length-1){
						// 如果是最后一个
						if(scrollTop >= top-topOne){
							if(that.activeKey != i){
								that.activeKey = i
							}
						} 
					}
				}
			},
			// 根据扫码获取的id获取餐桌信息
			getTableInfo(){
                   this.$myRequest({
                   						 url : "/table/queryTableInfo",
                   						 data : { table_id: this.table_id},
										 method : 'post'
                   					 }).then(res => {
                   						 
										 this.tableInfo = res.data.tableInfo[0]
										 console.log(this.tableInfo)
                   						 this.$forceUpdate();
                   					 })
			},
			// 菜单添加菜品数量
			increment(goods){
				console.log('number:'+goods.number)
				console.log(this.goods_cat)
				if(goods.number === undefined){
					goods.number = 1
				}
				else{
					goods.number++
				}
				// 第一次添加到购物车的情况,如果购物车为空,则添加商品
				if(this.goods_cat.length ===0){
					this.goods_cat.push({
										goods_id : goods.goods_id,
					                    name : goods.name,
					                    price : goods.price,
					                    number:1,
										img: goods.img,
									})
					this.cat_num++;
					this.getPrice();
				}
				// 不是第一次添加到购物车的情况
				else{
					for(let i = 0; i < this.goods_cat.length; i++){
						// 如果查询到表单中已有，则数量+1,且购物车数量+1
						if(this.goods_cat[i].name === goods.name) {
							this.goods_cat[i].number++;		//购物车商品的数量+1
							this.getPrice();
							this.cat_num++;		//购物车数量+1
							return;
						}
						// 没有则加入购物车
						// 插入表单数据
						else if(this.goods_cat.length - 1 === i && this.goods_cat[i].name !== goods.name){
							
							this.goods_cat.push({
												goods_id : goods.goods_id,
												name : goods.name,
												price : goods.price,
												number:0,
												img: goods.img,
											})
							this.goods_cat[i+1].number++;		//购物车商品的数量+1	
							this.getPrice();
							this.cat_num++;				//购物车数量+1 
							return;
						}
						
					}
				}
				
			},
			// 菜单减少菜品数量,如果为零则不显示减号,且不允许点击购物车
			decrement(item){
				// 1.减少购物车中商品的数量  2.减少购物车总数量   2.减少菜单中商品的数量
				// 获取id,然后在goods_cat中遍历查看是否存在
				for(let index in this.goods_cat){
					if(this.goods_cat[index].goods_id === item.goods_id){
						this.goods_cat[index].number--;
						this.getPrice();
						this.cat_num--;
						item.number--;
						if(this.goods_cat[index].number === 0){
							this.goods_cat.splice(index,1);
						}
					}
				}
				
			},
			// 购物车加按钮
			cat_increment(item){
				item.number++;	//购物车中商品数量+1
				this.cat_num++;	//购物车数量+1
				for(let i = 0; i < this.tabsList.length; i++){
					let goodslist = this.tabsList[i].goods_list;
					for(let j = 0; j < goodslist.length; j++){
						if(goodslist[j].name === item.name){
							goodslist[j].number++;		//菜单中对应的菜品数量+1
							this.getPrice();
							return;
						}
					}
				}
				
			},
			// 购物车减按钮
			cat_decrement(item,index){
				item.number--;		//购物车中商品数量-1
				
				this.getPrice();
				this.cat_num--;		//购物车数量-1
				if(this.goods_cat[index].number === 0){		//购物车数量为零则删除该项
					this.goods_cat.splice(index,1);
					if(this.goods_cat.length === 0){
						this.popupShow = false;
					}
				}
				for(let i = 0; i < this.tabsList.length; i++){
					let goodslist = this.tabsList[i].goods_list;
					for(let j = 0; j < goodslist.length; j++){
						if(goodslist[j].name === item.name){
							goodslist[j].number--;		//菜单中对应的菜品数量-1
							return;
						}
					}
				}
			},
			// 获取总价格
			getPrice(){
				let total = 0;
				if(this.goods_cat.length === 0) {
					this.price = 0
				}
				else{
					for(let item of this.goods_cat){
						total = total + item.number * item.price;
					}
					console.log(this.price)
					this.price = total;
				}
			},
			// 清空购物车
			clearCar(){
				this.goods_cat =[];		//购物车置空
				
				this.cat_num = 0;		//购物车数量置0
				
				for(let i = 0; i < this.tabsList.length; i++){		//菜单置0
					let goodslist = this.tabsList[i].goods_list;
					for(let j = 0; j < goodslist.length; j++){
							goodslist[j].number=0;		//菜单中对应的菜品数量重置为0
							
					}
				}
				this.getPrice();
				this.popupShow = false;
			},
			// 购物车点击事件
			isShowCat(){
				if(this.goods_cat.length===0) return;
				this.popupShow = !this.popupShow;
			},
			// 购物车关闭
			onClose(){
				this.popupShow = false;
				 this.$forceUpdate();
			},
			// 购物车提交订单按钮
			onSubmit(){
				if(this.isSubmit === true) return ;	//是否已经提交了订单
				if(this.goods_cat.length===0) return;
				this.orderPopupShow = true;
			},
			// 提交订单页关闭
			onOrderPopupClose(){
				this.orderPopupShow = false;
			},
			// 提交订单信息
			submitOrder(){
			
					// 1.改变餐台状态
					this.$myRequest({
						 url:"/table/updateTableStatus",
						 data:{table_id:this.table_id,status:this.tableInfo.status},
						 method:'POST'
					 }).then(res => { 
						 console.log(res)
					 })
					// 2.下单,并获取返回的订单号,
					const orderInfo = {
						table_id:this.table_id,
						number:this.peopleNum,
						remark:this.remark
					}
					this.$myRequest({
						url:'/orders/create',
						method:'POST',
						data: orderInfo
					}).then(res => {
						 if(res.data.status !== 200)
						     return ;
						 this.order_id = res.data.order_id;
						  // 2.创建订单详情
						  this.$myRequest({
						  	url:'/orders/insertGoodsDetail',
						  	method:'POST',
						  	data: {order_id:this.order_id,menulist:this.goods_cat}
						  }).then(res => {
								this.goods_cat = []
								this.isSubmit = true;
								this.tabsActive = 1;
								this.orderPopupShow = false;
								this.$myRequest({
									url:'/orders/getGoodsByOrderId',
									method:'POST',
									data: {order_id:this.order_id}
								}).then(res => {
										  this.orderDetail = res.data;
										  for(let item of this.orderDetail){
											  this.orderDetailTotal = this.orderDetailTotal + item.price*item.number
											  this.orderDetailNumber = this.orderDetailNumber + item.number
										  }
								})
						 })
					 })
							 

					// 3.提醒后台处理订单 socket.io
					   // 发送消息，这里可以用发送事件进行消息发送
					socket.emit('sendMsg', {
					      orderInfo: '您有一条新的订单请及时处理',
						  tableInfo: this.tableInfo
					})
					
			},
			// 呼叫服务员
			callStaff(){
				socket.emit('callStaff', {
				      orderInfo: '上帝需要服务',
					  tableInfo: this.tableInfo
				})
			}
		},
	   created() {
			// 查看当前是否已经开台
			// post('table/queryTableInfo', table).then(res => {
			//         this.table = res.data.tableInfo[0]
			//       })
			 
			//渲染 商品分类 以及 商品
			this.getTabsList();
			 // this.goodsCount();
	   },
	   onLoad(option){
		   that = this;
		   uni.getSystemInfo({
		   	success:(result) => {
				that.windowHeight = result.windowHeight;
				that.windowWidth = result.windowWidth;
				this.$forceUpdate();
			}
		   })
		   // 1.获取餐桌id
	        const scene = decodeURIComponent(option.table_id);
			this.table_id = option.table_id;
			console.log('餐桌id:'+this.table_id);
			this.$myRequest({
				url:'/table/queryTableInfo',
				method:'POST',
				data: {table_id:this.table_id}
			}).then(res => {
				console.log('当前餐桌状态')
				console.log(res.data.tableInfo[0].status)
				if(res.data.tableInfo[0].status === '就餐'){
						this.isSubmit = true;
						this.tabsActive = 1;
						// 2.获取订单id然后结账
						this.$myRequest({
							url:'/orders/getOrderId',
							method:'POST',
							data: {table_id:this.table_id}
						}).then(res => {
							  this.order_id = res.data[0].order_id;
							  // 3.根据订单id获取订单详情
							  this.$myRequest({
							  	url:'/orders/getGoodsByOrderId',
							  	method:'POST',
							  	data: {order_id:this.order_id}
							  }).then(res => {
								  this.orderDetail = res.data;
								  for(let item of this.orderDetail){
									  this.orderDetailTotal = this.orderDetailTotal + item.price*item.number
									  this.orderDetailNumber = this.orderDetailNumber + item.number
								  }
							  })
							  
						})
							  
				}
			})	 
			
			this.getTableInfo();
			// 获取列表商品数据            
			// this.getTabsList()
			// this.getTabsList();
			// 获取右侧所有商品分类的top值
			setTimeout(function(){
				that.tabsList.forEach(function(v) {
					uni.createSelectorQuery()
					.select('#id'+v.category_id)
					.boundingClientRect(function(rect) {
						if(rect) {
							let top = Number(rect.top)
							that.rightTopArray.push(top)
						}
					})
					.exec()
				})
				
			}, 3000);
			
	     },
		 mounted(){
		       
		 },
		 onReady() {
		
		 }
	}
</script>

<style lang='less'>
	page {
	    height: 100%;
	}
	.main {
		width: 100%;
		height: 100%;
	}
	.titlemessage {
		display: flex;
	}
	.titlemessageone {
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		line-height: 20rpx;
		font-size: 30rpx;
		margin-left:25rpx;
		width: 15%;
	}
	.titlemessagetwo {
		margin-top: 30rpx;
		margin-bottom: 30rpx;
		line-height: 20rpx;
		font-size: 30rpx;
		margin-left:25rpx;
		margin-right:25rpx;
		width: 85%;

	}
	.title {
		margin-top: 30rpx;
		margin-bottom: 10rpx;
		line-height: 20rpx;
		font-size: 25rpx;
		padding-bottom: 10rpx;
		margin-left:25rpx;
	}
	.header {
		height: 90rpx;
		line-height: 90rpx;
		font-size: 30rpx;
		text-align: left;
		font-weight: bold;
		margin-left:25rpx;
	}

	.leftscroll {
		margin-bottom: 30%;
		}
	.rightscroll {
		margin-bottom: 30%;
		}


	.cat_img_view {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background-color: #e64340;
		border: 15rpx solid rgba(50, 50, 50, 1);
		margin-bottom: 30rpx;
	}
	.subbar {
		background-color: rgb(50,50,50);
	}
	.cat_bottom1_view{
	  display: flex;
	  justify-content:space-between;
	  align-items:center;
	  text-align: center;
	  height: 80rpx;
	  font-size: 28rpx;
	  border-bottom: 1rpx solid rgba(170, 170, 170, 0.5);
	}
	.decrement_btn {
		width: 30rpx;
		height: 30rpx;
	}
	
	.cat_img{
		display: flex;
		justify-content: left;
		
	}
	.cat_num{
	 position: absolute;
	  width: 50rpx;
	  height: 50rpx;
	  top:-30%;
	  left: 13%;
	  /* margin-bottom: 30rpx; */
	  background-color: #e64340;
	  /* padding: 2.5rpx; */
	  border-radius: 50%;
	  display: flex;
	  justify-content:center;
	  align-items:Center;
	  color: white;
	  font-size: 25rpx;
	  border: 1rpx solid rgba(50, 50, 50, 0.3);
	
	}
	.submitOrder {
	  border-bottom: 0px;
	}
	.lableClass {
		color: rgb(250,197,72)!important;
		font-weight: 900!important;
	}
/* 	.orderPopup {
	display: flex;
	justify-content: space-between;
    flex-direction: column;
    align-items: center;
	} */
</style>
