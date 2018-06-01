<template>
	<div>
		<div v-bind:style="style.container">
			<div v-bind:style="style.header">
				<span v-bind:style="style.headerIcon"></span>
				<span v-bind:style="style.headerTitle">豪华黄钻免费试用所有气泡皮肤</span>
		  		<span v-bind:style="style.headerBtn" v-on:click="openSuperVip">{{data.userInfo.deluxe ? '续费' : '开通'}}豪华黄钻</span>
			</div>
			<div v-bind:style="style.headerBtm"></div>
		</div>

		<preview :previewObj="data.previewObj" :defaultId="data.defaultId" @switchEvent="use" @vipEvent="openVip" @superVipEvent="openSuperVip"></preview>

		<div v-bind:style="style.main">
			<cate v-for="(item, index) in data.cateObjArr"  @cateEvent=choosen :cateObj="item" :defaultId="data.defaultId" :num="index" ></cate>
		</div>
	</div>
</template>
<script>

import ajax from '../../lib/ajax.js'
import Data from './data.js'

import preview from './previewApp.vue'
import cate from './cateApp.vue'

let style = {
	container: {
		backgroundColor: '#f8f8f8',
		position: 'fixed',
		zIndex: 10,
		top: 0,
		left: 0,
		right: 0
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		height: "30px",
		padding: "7px 10px"
	},
	headerTitle: {
		fontSize: '14px'
	},
	headerBtn: {
		position: 'absolute',
		padding: '0 12px',
		height: "30px",
		lineHeight: "30px",
		color: "#A64800",
		backgroundColor: "#FFD838",
		textAlign: "center",
		top: "7px",
		right: "2%",
		borderRadius: "2px",
		fontSize: "14px"
	},
	headerIcon: {
		backgroundImage: 'url(//qzonestyle.gtimg.cn/touch/proj-qzone-app/stores/sprite/colorful-font-mog180117104647.png)',
		backgroundPosition: '-200px -103px',
		height: '18px',
		width: '18px',
		marginRight: '5px',
		fontSize: '14px'
	},
	headerBtm: {
		borderBottom: '1px solid #cfcfcf'
	},
	main: {
		marginTop: '40px'
	}
}
export default {
	components: {
        'cate': cate,
        'preview': preview
    },
	created() {
		let me = this;
		let Promise1 = ajax.request({
			"url": "http://activity.qzone.qq.com/fcg-bin/v2/fcg_get_user_info",
			"type": "GET"
		})

		let Promise2 = ajax.request({
			"url": "http://mqzmall.qzone.qq.com/fcg-bin/material_cgi/fcg_get_material_tab",
			"type": "GET"
		})

		let Promise3 = ajax.request({
			"url": "http://mqzmall.qzone.qq.com/fcg-bin/material_cgi/fcg_get_material_my_item",
			"type": "GET"
		})
		Promise.all([Promise1, Promise2, Promise3].map(p => p.catch((error) =>
			 error))).then(values => {
			me.data.userInfo = values[0] == me.proxyData('fakeData' ? Data.userInfo : values[0], 'userInfo');
			me.data.homeData = values[1] == me.proxyData('fakeData' ? Data.materialInfo : values[1], 'homeData');
			me.data.mineData = values[2] == me.proxyData('fakeData' ? Data.mineInfo : values[2], 'mineData');
		})
	},
	data() {
		return {
			data: {
				userInfo: {},
				cateObjArr: [],
				defaultId: 0,
				previewObj: {}
			},
			style: style
		}
	},
	methods: {
		proxyData: function(data, type) {
			let me = this;
			switch (type) {
				case 'userInfo':

				break;
				case 'homeData':
					var arr = [];
					var isPrimaryScreen = true;
					var homeData = data.data;
					var cateArr = homeData.material_tab_get_rsp.tab_rsp.cates || [];
					var firstTab = cateArr[0];

					var defaultId = Number(homeData.material_tab_get_rsp.tab_rsp.extend_info && homeData.material_tab_get_rsp.tab_rsp.extend_info.iLastSparkleId || 0);
					// 添加第一個默認元素
					firstTab.items.unshift({
						item_id: 0
					});

					firstTab.items = firstTab.items.filter(function(element) {
						return element.item_id !== 13440;
					});

					firstTab.item_count = firstTab.items.length;
					for (var i = 0; i < cateArr.length; i++) {
						var cateObj = cateArr[i];

						cateObj.i = i;
						cateObj.userInfo = me.userInfo;
						if (!cateObj.item_count) {
							continue;
						}
						if (i > 2) {
							isPrimaryScreen = false;
						}
						cateObj.isPrimaryScreen = isPrimaryScreen;
						arr.push(cateObj);
					}
					me.data.defaultId = defaultId;
					me.data.cateObjArr = arr;
	                me.data.previewObj = {
	                    userInfo: me.userInfo,
	                    popup: false,
	                    bg: '',
	                    usetype: '',
	                    text_color: ''
	                }
				break;
				case 'mineData':

				break;
			}
		},
		choosen: function () {
            let me = this;
            let id = arguments[0];
            let json = arguments[1];
            console.warn(json);
            if (id == me.defaultId) {
                return;
            }
            me.data.defaultId = id;
            me.data.previewObj.bg = JSON.parse(json).url;
            console.warn(me.data.previewObj.bg);
            if (typeof me.data.previewObj.bg == 'undefined') {
                me.data.previewObj.bg = '//qzonestyle.gtimg.cn/qzone/space_item/material/CustomSparkle/org/0/13440/thumb1.png'
            }
            me.data.previewObj.usetype = JSON.parse(json).type;
            me.data.previewObj.text_color = JSON.parse(json).text_color;
            if (!!id && id != '0') {
                me.showPopup();
            } else {
                me.hidePopup();
                me.use('default');
            }
        },
        showPopup() {
        	let me = this;
        	me.data.previewObj.popup = true;
        },
        hidePopup() {
        	let me = this;
        	me.data.previewObj.popup = false;
        },
        openVip() {

        },
        openSuperVip() {},
        use() {

        }
	}
}
</script>
