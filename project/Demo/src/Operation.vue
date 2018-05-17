<template>
	<div style="display: flex; flexDirection: column;">
		<div style="backgroundColor: #000; width: 100vw; height: 300px;"	>
			<span style="fontSize: 180px; color:#fff; marginLeft: 80px; marginTop: 20px;">{{text}}</span>
		</div>
		<div style="display: flex; flexDirection: row;">
			<div style="width: 70vw; height: 500px;display: flex; 	flexDirection: row; flexWrap:wrap">
				<span style="width:140px; marginRight: 20px; 	marginBottom:20px; backgroundColor: #808080;  height: 140px; fontSize:48px; 	color:#fff; textAlign:center" v-for="(item, index) in 	numberList" v-on:click="click(item)">{{item}}</span>
			</div>
			<div style="width: 20vw; height: 500px;display: flex; 	flexDirection: row; flexWrap:wrap">
				<span style="width:140px; marginRight: 20px; 	marginBottom:5px; backgroundColor: #ffbf00; 	borderRadius: 140px; height: 140px; fontSize:48px; 	color:#fff; textAlign:center" v-on:click="add">+</span>
				<span style="width:140px; marginRight: 20px; 	marginBottom:5px; backgroundColor: #ffbf00; 	borderRadius: 140px; height: 140px; fontSize:48px; 	color:#fff; textAlign:center" v-on:click="calucate">=</span>
				<span style="width:140px; marginRight: 20px; 	marginBottom:5px; backgroundColor: #ffbf00; 	borderRadius: 140px; height: 140px; fontSize:48px; 	color:#fff; textAlign:center" v-on:click="clear">C</span>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			text: 0,
			res: 0,
			numberList: Array.from('987654321')
		}
	},
	methods: {
		click: function(arg) {
			if (this.text == '0') {
				this.text = arg;
			} else {
				this.text += arg;
			}
		},
		clear: function() {
			this.text = '0';
			this.res = 0;
		},
		calucate: function() {
			this.res += parseInt(this.text, 0);
			this.text = this.res.toString();
		},
		add: function() {
			this.res += parseInt(this.text, 0);
			this.text = '0';
		}
	}
}
</script>