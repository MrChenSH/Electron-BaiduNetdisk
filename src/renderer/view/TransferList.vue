<template>
	<el-container>
		<el-aside class="nav-aside">
			<el-menu :default-active="activeIndex" class="nav-menu" @select="index => activeIndex = index">
				<el-menu-item index="downloading">
					<i class="el-icon-download"></i>
					<small>正在下载(2)</small>
				</el-menu-item>
				<el-menu-item index="uploading">
					<i class="el-icon-upload2"></i>
					<small>正在上传(1)</small>
				</el-menu-item>
				<el-menu-item index="completed">
					<i class="el-icon-check"></i>
					<small>传输完成({{transfer.completed}})</small>
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-container class="main-view">
			<el-header height>
				<el-row
						type="flex"
						:gutter="10"
						align="middle"
						class="toolbar"
						v-if="activeIndex === 'completed'"
				>
					<el-col tag="span">
						{{ transfer.text }}
					</el-col>
					<el-col style="text-align: right;">
						<el-button plain>清除所有记录</el-button>
					</el-col>
				</el-row>
				<el-row v-else :gutter="10" type="flex" align="middle" class="toolbar" justify="space-around">
					<el-col tag="small" style="width: auto;">
						{{ transfer.text }}
					</el-col>
					<el-col style="flex: 1;">
						<el-progress
								text-inside
								:stroke-width="15"
								class="transfer-progress"
								:percentage="transfer.percent"
						></el-progress>
					</el-col>
					<el-col style="width: auto;">
						<el-button plain>全部开始</el-button>
						<el-button plain>全部暂停</el-button>
					</el-col>
				</el-row>
			</el-header>
			<el-table
					:data="files"
					height="100%"
					ref="fileTable"
					:show-header="false"
					highlight-current-row
					@row-contextmenu="onRowContextMenu"
					@selection-change="onSelectionChange"
					@row-click="row => selectionRow = row"
			>
				<el-table-column prop="filename" min-width="500"></el-table-column>
				<el-table-column prop="time" min-width="150"></el-table-column>
				<el-table-column prop="progress" min-width="200"></el-table-column>
			</el-table>
		</el-container>
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
			selectionRow(row, old) {
			},
			selectionRows(rows) {
			}
		},
		methods: {
			onMenuSelect() {
			},
			onRowContextMenu(row, e) {
				let me = this
				e.stopPropagation()
			},
			onSelectionChange(selections) {
				this.selectionRows = selections
			},
			/**
			 * 打开文件
			 */
			onClickToOpen(row) {
			}
		}
	}
</script>
