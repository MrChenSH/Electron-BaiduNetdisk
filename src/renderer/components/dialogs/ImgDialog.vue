<template>
	<el-dialog fullscreen append-to-body custom-class="img-dialog" :visible.sync="visible">
		<i class="el-icon-close" @click="$emit('close')"></i>
		<el-button
			circle
			class="left"
			icon="el-icon-arrow-left"
			:disabled="imageIndex === 0"
			@click="loading = true, imageIndex -= 1"
		></el-button>
		<div
			style="flex: 1;"
			v-loading="loading"
			element-loading-text="拼命加载中"
			element-loading-background="rgba(0, 0, 0, 0.8)"
		>
			<img
				class="img-preview"
				@load="loading = false"
				v-if="images[imageIndex]"
				:src="images[imageIndex].src"
				:alt="images[imageIndex].name"
			>
		</div>
		<el-button
			circle
			class="right"
			icon="el-icon-arrow-right"
			@click="loading = true,imageIndex += 1;"
			:disabled="imageIndex === images.length-1"
		></el-button>
	</el-dialog>
</template>

<script>
export default {
	data() {
		return {
			visible: true,
			loading: true,
			imageIndex: this.index
		}
	},
	props: {
		images: {
			type: Array,
			default: []
		},
		index: {
			type: Number,
			default: null
		}
	},
	watch: {
		visible(visible) {
			if (!visible) this.$emit('close')
		}
	}
}
</script>

