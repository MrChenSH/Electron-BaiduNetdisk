<template>
	<el-dialog fullscreen append-to-body custom-class="img-dialog" :visible.sync="visible">
		<i class="el-icon-close" @click="visible = false"></i>
		<el-button
			circle
			class="left"
			v-if="imageIndex > 0"
			@click="imageIndex -= 1"
			icon="el-icon-arrow-left"
		></el-button>
		<div
			v-loading="loading"
			style="height: 100%;"
			element-loading-text="拼命加载中"
			element-loading-background="rgba(0, 0, 0, 0.8)"
		>
			<img
				class="img-preview"
				@load="loading = false"
				v-if="images[imageIndex]"
				:src="images[imageIndex].src"
				:alt="images[imageIndex].alt"
			>
		</div>
		<el-button
			circle
			class="right"
			@click="imageIndex += 1"
			icon="el-icon-arrow-right"
			v-if="imageIndex < images.length - 1"
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
		},
		imageIndex() {
			this.loading = true
		}
	}
}
</script>

