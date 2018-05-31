<template>
	<div>
		<div v-bind:style="style.container">
			<div v-bind:style="style.header">
				<span v-bind:style="style.headerIcon"></span>
				<span v-bind:style="style.headerTitle">豪华黄钻免费试用所有气泡皮肤</span>
		  		<span v-bind:style="style.headerBtn" v-on:click="openSuperVip">{{userInfo.deluxe ? '续费' : '开通'}}豪华黄钻</span>
			</div>
			<div v-bind:style="style.headerBtm"></div>
		</div>

		<div v-bind:style="style.main">
			<div class="ocupy"></div>
			<div v-bind:style="style.itemList">
				<span v-bind:style="style.itemListTitle">倾心</span>
				<div v-bind:style="style.itemArea">
					<div v-bind:style="style.item">
						<div v-bind:style="style.itemPic"></div>
						<span v-bind:style="style.itemText">默认效果</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

import ajax from '../../lib/ajax.js'

let style = {
	container: {
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
	},
	itemList: {
		position: 'relative'
	},
	itemListTitle: {
	    fontSize: '17px',
    	padding: '14px 10px 12px'
	},
	itemArea: {
		paddingRight: '25px'
	},
	item: {
		width: '50%',
    	borderLeftWidth: '25px'
	},
	itemPic: {
		backgroundImage: 'url("//qzonestyle.gtimg.cn/qzone/space_item/material/CustomSparkle/org/0/13440/thumb1.png")',
		paddingTop: '50%',
		backgroundPosition: '50% 50%'
	},
	itemText: {
	    maxWidth: '100%',
	    padding: '4px',
	    fontSize: '14px',
	    height: '24px',
	    lineHeight: '24px',
	    color: '#a0a0a0',
	    textAlign: 'center',
	    overflow: 'hidden',
	    verticalAlign: 'middle'
	}
}
export default {
	created() {
		ajax.request('')
	},
	data() {
		return {
			data: {
				userInfo: {},
				homeData: {},
				mineData: {}
			},
			style: style
		}
	},
	methods: {
		openSuperVip: function() {

		}
	}
}
</script>
