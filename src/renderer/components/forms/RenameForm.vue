<template>
	<el-form
		inline
		:model="file"
		ref="rename_form"
		:show-message="false"
		@validate="onValidate"
		@submit.native.prevent
		:class="listView ? 'list-view-form' : 'thumb-view-form'"
	>
		<el-form-item
			required
			prop="server_filename"
			:rules="RULES.fileName"
			@keyup.esc.native="cancelEdit"
			@keyup.enter.native="commitEdit"
			@dblclick.native="e => e.stopPropagation()"
			@contextmenu.native="e => e.stopPropagation()"
		>
			<el-tooltip ref="error_tip" manual transition :content="tipContent" :disabled="tipDisabled">
				<el-input ref="rename_input" placeholder="请输入文件名称" v-model="file.server_filename"></el-input>
			</el-tooltip>
		</el-form-item>
		<el-form-item v-if="listView">
			<el-button type="success" icon="el-icon-check" @click="commitEdit"></el-button>
			<el-button type="danger" icon="el-icon-close" @click="cancelEdit"></el-button>
		</el-form-item>
	</el-form>
</template>

<script>
export default {
	data() {
		return {
			tipContent: null,
			tipDisabled: true
		}
	},
	props: {
		file: {
			type: Object,
			default: null
		},
		listView: {
			type: Boolean,
			default: null
		}
	},
	created() {},
	mounted() {
		this.startEdit()
	},
	methods: {
		onValidate(prop, valid, error) {
			let me = this
			me.tipDisabled = valid
			if (error) me.tipContent = error
			me.$refs.error_tip.showPopper = !valid
		},
		/**
		 * 开始编辑
		 */
		startEdit() {
			let me = this
			me.$refs.rename_input.focus()
			if (me.file.isdir) me.$refs.rename_input.select()
			else me.$refs.rename_input.$refs.input.setSelectionRange(0, me.file.server_filename.lastIndexOf('.'))
		},
		/**
		 * 提交编辑
		 */
		commitEdit() {
			let me = this
			me.$refs.rename_form.validate(valid => {
				if (valid) {
					me.file.editing = false
				}
			})
		},
		/**
		 * 取消编辑
		 */
		cancelEdit() {
			let me = this
			me.file.editing = false
			me.$refs.rename_form.resetFields()
		}
	}
}
</script>
<style lang="less" scoped>
.list-view-form .el-form-item {
	margin-bottom: 0;
	/deep/input {
		width: 300px;
	}
}

.thumb-view-form .el-form-item {
	margin: -5px;
	/deep/input {
		padding: 0 8px;
		text-align: center;
	}
}
</style>

