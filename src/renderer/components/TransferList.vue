<template>
	<el-container>
		<el-aside width="165px" class="nav-aside">
			<el-menu :default-active="activeIndex" class="nav-menu" @select="index => activeIndex = index">
				<el-menu-item index="downloading" class="nav-menu-item">
					<i class="el-icon-download"></i>
					<small>正在下载(2)</small>
				</el-menu-item>
				<el-menu-item index="uploading">
					<i class="el-icon-upload2"></i>
					<small>正在上传(1)</small>
				</el-menu-item>
				<el-menu-item index="completed" class="nav-menu-item">
					<i class="el-icon-check"></i>
					<small>传输完成(3)</small>
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-container>
			<el-header height>
				<el-row
					type="flex"
					:gutter="10"
					align="middle"
					class="toolbar"
					v-if="activeIndex === 'completed'"
				>
					<el-col>
						<span style="vertical-align: -webkit-baseline-middle;">{{ transfer.text }}</span>
						<el-button plain style="float: right;">清除所有记录</el-button>
					</el-col>
				</el-row>
				<el-row v-else :gutter="10" type="flex" align="middle" class="toolbar">
					<el-col :span="1" style="text-align: right;min-width: 80px;">
						<small>{{ transfer.text }}</small>
					</el-col>
					<el-col>
						<el-progress
							text-inside
							:stroke-width="15"
							class="transfer-progress"
							:percentage="transfer.percent"
						></el-progress>
					</el-col>
					<el-col :span="1" style="text-align: right;min-width: 200px;">
						<el-button plain>全部开始</el-button>
						<el-button plain>全部暂停</el-button>
					</el-col>
				</el-row>
			</el-header>
			<el-main style="position: relative;">
				<el-table
					:data="files"
					height="100%"
					ref="fileTable"
					:show-header="false"
					highlight-current-row
					style="position: absolute;"
					@row-contextmenu="onRowContextMenu"
					@selection-change="onSelectionChange"
					@row-click="row => selectionRow = row"
				>
					<el-table-column prop="filename" min-width="500"></el-table-column>
					<el-table-column prop="time" min-width="150"></el-table-column>
					<el-table-column prop="progress" min-width="200"></el-table-column>
				</el-table>
			</el-main>
		</el-container>

		<v-contextmenu ref="rowContextMenu" style="width:120px;">
			<v-contextmenu-item :disabled="menuDisableds.open" @click="onClickToOpen(selectionRow)">打开</v-contextmenu-item>
			<v-contextmenu-item>分享</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item>下载</v-contextmenu-item>
			<v-contextmenu-item>分享并下载</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item>复制到...</v-contextmenu-item>
			<v-contextmenu-item :disabled="menuDisableds.moveTo">移动到...</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item :disabled="menuDisableds.delete">删除</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item>属性</v-contextmenu-item>
		</v-contextmenu>
	</el-container>
</template>

<script>
export default {
	name: 'TransferList',
	data() {
		return {
			files: [],
			selectionRow: null,
			selectionRows: [],
			activeIndex: 'downloading',
			transfer: {
				percent: 0,
				completed: 0,
				text: '下载总进度'
			},
			menuDisableds: {
				open: false,
				moveTo: false,
				delete: false,
				rename: false
			}
		}
	},
	created() {
		let me = this
		// console.log(me)
	},
	watch: {
		activeIndex(index) {
			let me = this
			me.transfer.percent = Number((Math.random() * 100).toFixed())
			if (index === 'downloading') {
				me.transfer.text = '下载总进度'
			} else if (index === 'uploading') {
				me.transfer.text = '上传总进度'
			} else {
				me.transfer.completed = me.transfer.percent
				me.transfer.text = `共传输完成${me.transfer.completed}个文件`
			}
		},
		selectionRow(row, old) {},
		selectionRows(rows) {}
	},
	methods: {
		onMenuSelect() {},
		onRowContextMenu(row, e) {
			let me = this
			e.stopPropagation()
			me.cancelEdit()
			me.selectionRow = row
			me.$refs.tableContextMenu.hide()

			let pos = { top: e.pageY, left: e.pageX }

			if (pos.top + 272 > window.innerHeight) pos.top -= 272
			if (pos.left + 122 > window.innerWidth) pos.left -= 122

			me.$refs.rowContextMenu.show(pos)
		},
		onSelectionChange(selections) {
			this.selectionRows = selections
		},
		/**
		 * 打开文件
		 */
		onClickToOpen(row) {}
	}
}
</script>
