<template>
	<div v-bind:style="style.itemList">
		<span v-bind:style="style.itemListTitle">倾心</span>
		<div v-bind:style="style.itemListArea">
			<item v-for="(item, index) in data.itemObjArr" :itemObj="item" :defaultId="defaultId" @choosen="itemEvent"></item>
		</div>
		<div v-bind:style="style.cateBtm"></div>
	</div>
</template>

<script>
import item from './itemApp.vue'

let style = {
	itemListTitle: {
	    fontSize: '17px',
    	padding: '14px 10px 12px'
	},
	itemList: {
		position: 'relative'
	},
	itemListArea: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap:'wrap',
		justifyContent: 'space-between',
		padding: '0 25px'
	},
	cateBtm: {
		borderTop: '1px solid #ccc'
	}
}
export default {
	props: ['cateObj', 'defaultId', 'num'],
	components: {
        'item': item
    },
	created() {
		let me = this;
		let arr = [];

		let itemArr = me.cateObj.items;
		let item_count = me.cateObj.item_count;

		for (let i = 0; i < item_count; i++) {
			let itemObj = itemArr[i];
			if (!itemObj) {
				break;
			}
			itemObj.userInfo = me.cateObj.userInfo;
			itemObj.isPrimaryScreen = me.cateObj.isPrimaryScreen;
			itemObj.canOpenVip = me.cateObj.canOpenVip;
			itemObj.selected = me.defaultId == itemObj.item_id;

			arr.push(itemObj);
		}
		// 处理超过6个产生更多
		if (arr.length > 6) {
			arr = arr.slice(0, 6);
			arr[5].cate_id = me.cateObj.cate_id;
			arr[5].is_more = true;
		}
		me.data.itemObjArr = arr;
	},
	data() {
		return {
			style: style,
			data: {
				itemObjArr: []
			}
		}
	},
	methods: {
       	itemEvent: function (arg) {
            var me = this;
            arg = Array.prototype.slice.call(arguments);
            arg.unshift('cateEvent');
            me.$emit.apply(this, arg);
        }
    }
}
</script>