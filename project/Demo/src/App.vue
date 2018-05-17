<template>
	<div style="display: flex; flexDirection: column; marginTop: 88px;">
		<div style="backgroundColor: #fed002; width: 100vw;display: flex; flexDirection: row; justifyContent: center">
			<img style="height: 40px;width: 40px;" src="https://qzonestyle.gtimg.cn/aoi/sola/20170601155558_l0Jl1I6myz.png"/>
			<span style="fontSize: 24px; color: #007fff;">这是一个可能会有bug的计算器Demo</span>
		</div>
		<operation></operation>
	</div>
</template>

<script>

import operation from './Operation.vue'

export default {
	data() {
		return {
		}
	},
	components: {
		'operation': operation
	}
}
</script>