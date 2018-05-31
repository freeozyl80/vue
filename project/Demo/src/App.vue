<template>
	<div style="display: flex; flexDirection: column; marginTop: 88px;" :class="[b, 'ceshi']">
		<div style="backgroundColor: #fed002; width: 100vw;display: flex; flexDirection: row; justifyContent: center">
			<img style="height: 40px;width: 40px;" src="https://qzonestyle.gtimg.cn/aoi/sola/20170601155558_l0Jl1I6myz.png"/>
			<span style="fontSize: 24px; color: #007fff;">这是一个可能会有bug的计算器Demo</span>
		</div>
		<operation></operation>
		<div style="width: 200px; height:200px; backgroundColor: #3f2023" v-on:click="animate()" ref="animate">
			<p>点我，快点我</p>
		</div>
	</div>
</template>

<script>

import operation from './Operation.vue'

export default {
	data() {
		return {
			b: 'test'
		}
	},
	components: {
		'operation': operation
	},
	methods: {
		animate: function() {
			this.$refs.animate.playKeyframe({
				animation_left: {
                    from: { left: "275px" },
                    "20%": { left: "550px" },
                    "50%": { left: "0px" },
                    "80%": { left: "550px" },
                    to: { left: "275px" }
                }
			}, {
				animation: "animation_left 1s linear",
			})
		}
	}
}
</script>