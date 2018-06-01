<template>
	<div>
		<div style="height: 0px;"  ref="preview"></div>
		<div v-show="previewObj.popup" ref="pop" v-bind:style="style.preview">
			<div v-bind:style="style.previewBg">
				<div v-bind:style="style.previewContent">
					<div v-bind:style="Object.assign(style.previewItem, {'backgroundImage': 'url(' + previewObj.bg +')'})"><span style="position:relative; overflow:hidden">开通豪华黄钻，使用个性气泡，你的评论，更加亮眼。</span></div>
				</div>
			</div>
			<div v-bind:style="style.previewSetting">
				<div v-bind:style="style.previewSettingDetail">
					<div v-bind:style="style.previewSettingInfo">
						<div style="margin:15px 0 0;">
							<p style="color: grey;fontSize: 13px;">评论气泡与字体装扮、炫彩字无法同时使用</p>
						</div>
					</div>
				</div>
				<div style="marginTop:15px; padding: 0 10px 10px;">
					<span v-if="type == 0" v-bind:style="Object.assign(style.previewSettingBtn, {'backgroundColor': '#00A3FF', 'color': '#fff'})">使用</span>
					<span v-if="type == 1" v-bind:style="Object.assign(style.previewSettingBtn, {'backgroundColor': '#ffd74b', 'color': '#a64600'})">开通黄钻使用装扮</span>
					<span v-if="type == 2" v-bind:style="Object.assign(style.previewSettingBtn, {'backgroundColor': '#ffd74b', 'color': '#a64600'})">开通豪华黄钻使用装扮</span>
					<span v-if="type == 3" v-bind:style="Object.assign(style.previewSettingBtn, {'backgroundColor': '#ffd74b', 'color': '#a64600'})">限免使用</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

let style = {
	preview: {
		position: 'fixed',
	    left: '0',
	    right: '0',
	    top: '0',
	    zIndex: '99',
	    boxShadow:' 0 0 5px rgba(0,0,0,.15)'
	},
	previewBg: {
	    backgroundColor: '#65D2FD',
	    padding: '20px 15px',
	    backgroundImage: 'url(//qzonestyle.gtimg.cn/touch/proj-qzone-app/stores/img/preview-mosaic-bg.png)',
	    backgroundSize: '100% auto',
	    backgroundPosition: '50% 0',
        position: 'relative',
    	zIndex: '2'
	},
	previewContent: {
	    position: 'relative',
	    paddingTop: '38.5%',
	    backgroundSize: '100% 100%',
	    boxShadow: '0 0 7px 0 rgba(0,0,0,.1)',
	    backgroundImage: 'url(//qzonestyle.gtimg.cn/aoi/sola/20171225212217_Z00OQ38f2v.png)'
	},
	previewSetting: {
		backgroundColor: '#fff',
    	zIndex: '2'
	},
	previewSettingDetail: {
	    display: 'flex',
	    flexDirection: 'column',
	    flex: '1',
	    position: 'relative'
	},
	previewSettingInfo: {
		padding: '0 12px',
    	flex: '1'
	},
	previewSettingBtn: {
		zIndex: '1',
		fontSize: '18px',
		textAlign: 'center',
		color: '#FFF',
		letterSpacing: '-.33em',
		borderRadius: '2px',
		lineHeight: '40px',
		position: 'relative'
	},
	previewItem: {
		width: '105px',
	    padding: '13px 30px',
	    overflow: 'hidden',
	    whiteSpace: 'nowrap',
	    backgroundSize: '100% 100%',
	    margin: '0 auto',
	    backgroundImage: 'url(//ue.qzone.qq.com/touch/proj-qzone-app/stores/img/pop.png)',
	    position: 'absolute',
	    bottom: '10%',
	    left: '22%',
	    height: '14px',
	    lineHeight: '14px',
	    fontSize: '14px'
	}
}
export default {
	props: ['previewObj', 'defaultId'],
	created() {
	},
	data() {
		return {
			style: style
		}
	},
    computed: {
    	'type': function () {
    		var me = this;
    		var type = 0; // 0使用，1黄钻，2豪华黄钻，3.限免
    		if (me.previewObj.userInfo && me.previewObj.usetype) {
    			if (me.previewObj.usetype == 0) {
    				type = 0;
    			} else if (me.previewObj.usetype == 2) {
    				if (me.previewObj.userInfo.vip == 1) {
    					type = 0;
    				} else {
    					type = 1;
    				}
    			} else if (me.previewObj.usetype == 14) {
    				if (me.previewObj.userInfo.deluxe == 1) {
    					type = 0;
    				} else {
    					type = 2;
    				}
    			} else if (me.previewObj.usetype == 12) {
    				type = 3
    			}
    		}
    		return type;
    	}
    }
}
</script>