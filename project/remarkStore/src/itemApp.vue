<template>
	<div v-bind:style="style.item">
		<div v-if="!itemObj.item_id" @click.stop="choose('0','{}', {})">
			<div v-bind:style="style.itemPic" style="background-image: url(//qzonestyle.gtimg.cn/qzone/space_item/material/CustomSparkle/org/0/13440/thumb1.png);"></div>
			<span v-bind:style="style.itemText">默认效果</span>
		</div>

		<div v-if="!!itemObj.item_id && !itemObj.is_more" @click.stop="choose(itemObj.item_id,necessary_json, $event)" setyl>
			<div v-bind:style="Object.assign(style.itemPic, {'backgroundImage': 'url(' + itemUrl +')'})" ></div>
			<div v-if="itemObj.item_type == 2"  v-bind:style="Object.assign(style.itemIcon, style.itemIconVip)"></div>
			<div v-if="itemObj.item_type == 14" v-bind:style="Object.assign(style.itemIcon, style.itemIconSvip)"></div>
			<div v-if="itemObj.item_type == 12" v-bind:style="Object.assign(style.itemIcon, style.itemIconFree)"></div>

			<span v-bind:style="style.itemText">{{itemObj.name}}</span>
		</div>
	</div>
</template>

<script>
let style = {
	item: {
		width: '45%',
    	borderLeftWidth: '25px',
    	position:'relative'
	},
	itemPic: {
		paddingTop: '50%',
		backgroundPosition: '50% 50%',
		backgroundSize: 'cover',
		position: 'relative'
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
	},
	itemIcon: {
	    width: '34px',
	    height: '34px',
	    position: 'absolute',
        zIndex: '2',
		backgroundImage: 'url(//qzonestyle.gtimg.cn/touch/proj-qzone-app/stores/sprite/ui-img-list.imp-mog180117104647.png)',
	    left: '0',
	    top: '0'
	},
	itemIconSvip: {
		backgroundPosition:'0 -105px'
	},
	itemIconVip: {
		backgroundPosition:'-105px -70'
	},
	itemIconFree: {
		backgroundPosition: '-105px -35px'
	}
}
export default {
	props: ['itemObj', 'defaultId'],
	created() {
		let me = this;
        let json = {};
        me.url = me.itemObj.files && me.itemObj.files[0] ? me.itemObj.files[0].url : '';
        me.extend_info = me.itemObj.extend_info || {};
        if(me.itemObj.banner && me.itemObj.banner.url) {
            json = {
                'url': me.itemObj.banner.url,
                'type': me.itemObj.item_type,
                'text_color': me.itemObj.extend_info.TextColor
            }
        }
        me.necessary_json = JSON.stringify(json);
        me.itemUrl = (me.itemObj.thumb && me.itemObj.thumb.url ? me.itemObj.thumb.url : 'http://placehold.it/360x200').replace('http:', 'https:');
	},
	data() {
		return {
			style: style,
			data: {
				itemUrl: '',
				url: '',
				extend_info: {},
				necessary_json: ''
			}
		}
	},
	methods: {
		choose: function(id, json) {
			let me = this;
			me.$emit('choosen', id, json)
		}
	}
}
</script>