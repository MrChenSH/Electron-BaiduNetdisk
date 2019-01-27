<template>
	<el-container>
		<el-aside width="165px" class="nav-aside">
			<el-menu :default-active="String(menuIndex)" class="nav-menu">
				<el-menu-item
					v-for="(item, i) in MENUS"
					:key="i"
					:index="String(i)"
					@click="onMenuSelect(item, i)"
				>
					<i :class="item.icon"></i>
					<small>{{ item.text }}</small>
				</el-menu-item>
			</el-menu>
			<el-progress
				status="text"
				color="#67C23A"
				:stroke-width="8"
				class="nav-progress"
				:percentage="quota.used / quota.total * 100"
			>{{ transferFileSize(quota.used, 3 , 0) + '/' + transferFileSize(quota.total, 3, 0) }}</el-progress>
		</el-aside>
		<el-container>
			<el-header height>
				<div class="toolbar">
					<el-dropdown size="small" placement="bottom-start">
						<el-button plain size="small" icon="el-icon-upload2" @click="uploadFiles('openFile')">上传</el-button>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item @click.native="uploadFiles('openFile')">上传文件</el-dropdown-item>
							<el-dropdown-item @click.native="uploadFiles('openDirectory')">上传文件夹</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-button
						plain
						size="small"
						icon="el-icon-download"
						:disabled="!Boolean(selectionRows.length)"
					>下载</el-button>
					<el-button
						plain
						size="small"
						icon="el-icon-share"
						:disabled="!Boolean(selectionRows.length)"
					>分享</el-button>
					<el-button
						plain
						size="small"
						icon="el-icon-delete"
						@click="onClickToDelte"
						:disabled="menuDisableds.delete"
					>删除</el-button>
					<el-button plain size="small" icon="el-icon-plus">新建文件夹</el-button>
					<el-dropdown size="small" split-button trigger="click" placement="bottom-start">
						<i class="el-icon-download"></i> 离线下载
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item>新建普通下载</el-dropdown-item>
							<el-dropdown-item @click.native="uploadBT">新建BT任务</el-dropdown-item>
							<el-dropdown-item @click.native="$emit('activeTab', 'offline-download')">查看下载列表</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-dropdown
						size="small"
						split-button
						trigger="click"
						placement="bottom-start"
						:disabled="!Boolean(selectionRows.length)"
					>
						<i class="el-icon-more"></i> 更多
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item>复制到…</el-dropdown-item>
							<el-dropdown-item :disabled="menuDisableds.moveTo">移动到…</el-dropdown-item>
							<el-dropdown-item
								:disabled="menuDisableds.rename"
								@click.native="selectionRow.editing = true"
							>重命名…</el-dropdown-item>
							<el-dropdown-item>移入隐藏空间</el-dropdown-item>
							<el-dropdown-item disabled>文档历史版本</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-button plain size="small" @click="test">测试按钮</el-button>
					<el-button plain size="small" icon="el-icon-menu" @click="listView = !listView">切换视图</el-button>
				</div>
				<el-row type="flex" align="middle" class="action-path">
					<el-col :span="1" style="min-width: 110px;">
						<el-button type="text" size="medium" icon="el-icon-arrow-left"></el-button>
						<el-button disabled type="text" size="medium" icon="el-icon-arrow-right"></el-button>
						<el-dropdown trigger="click" placement="bottom" style="margin-left: 10px;">
							<el-button type="text" size="medium" icon="el-icon-caret-bottom"></el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item @click.native="path = '/'">我的网盘</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
						<el-button
							type="text"
							size="medium"
							@click="loadFiles"
							:disabled="fileLoading"
							icon="el-icon-refresh"
							style="margin-left: 10px;"
						></el-button>
					</el-col>
					<el-col>
						<span class="split"></span>
						<el-breadcrumb separator-class="el-icon-arrow-right">
							<el-breadcrumb-item
								to="/"
								v-for="(item, i) in paths"
								:key="i"
								@click.native="path = item.path"
							>{{ item.text }}</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="1" style="min-width: 260px;">
						<el-input
							v-model="search.value"
							prefix-icon="split"
							placeholder="搜索我的网盘文件"
							@keyup.enter.native="onClickToSearch"
						>
							<i slot="suffix" class="el-input__icon el-icon-search" @click="onClickToSearch"></i>
						</el-input>
					</el-col>
				</el-row>
			</el-header>
			<el-main v-loading="fileLoading" style="position: relative;display: flex;">
				<el-table
					:data="files"
					height="100%"
					ref="fileTable"
					v-if="listView"
					highlight-current-row
					style="position: absolute;"
					@sort-change="onSortChange"
					@row-dblclick="onClickToOpen"
					v-contextmenu:tableContextMenu
					@select-change="onSelectChange"
					@row-contextmenu="onRowContextMenu"
					@selection-change="onSelectionChange"
					@row-click="row => selectionRow = row"
					v-selectable="{ selector : '.el-table__row', selectedClass : 'current-row' }"
					@header-contextmenu="(col, e) => e.stopPropagation()"
				>
					<el-table-column type="selection" width="30"></el-table-column>
					<el-table-column sortable label="文件名" min-width="500" prop="server_filename">
						<template slot-scope="{ row }">
							<div :class="getFileIconClass(row)" style="padding-left: 35px;">
								<RenameForm v-if="row.editing" :file="row" :listView="listView" @commitEdit="commitEdit"/>
								<el-button
									v-else
									type="text"
									@click="onClickToOpen(row)"
									:title="row.server_filename"
								>{{ row.server_filename }}</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column sortable prop="server_mtime" label="修改时间" min-width="150">
						<template
							slot-scope="{ row }"
						>{{ new Date(row.server_mtime * 1000).format('yyyy-MM-dd HH:mm:ss') }}</template>
					</el-table-column>
					<el-table-column sortable prop="size" label="大小" min-width="100">
						<template slot-scope="{ row }">{{ row.isdir ? '-' : transferFileSize(row.size) }}</template>
					</el-table-column>
				</el-table>
				<el-row
					v-else
					class="thumb-view"
					:flex="files.length === 0"
					v-contextmenu:tableContextMenu
					@select-change="onSelectChange"
					v-selectable="{ selector : '.thumb-item' }"
				>
					<el-col v-if="files.length === 0">
						<small style="color: #909399;">暂无数据</small>
						<br>
						<br>
						<el-upload multiple :action="URL.upload" :show-file-list="false">
							<el-button type="primary">上传文件</el-button>
						</el-upload>
					</el-col>
					<el-col
						v-else
						:span="1"
						class="thumb-item"
						v-for="file in files"
						:key="file.fs_id"
						v-contextmenu:rowContextMenu
						:title="file.server_filename"
						@click.native="selectionRow = file"
						@dblclick.native="onClickToOpen(file)"
						:selected="selectionRows.includes(file)"
						@contextmenu.native="e => {e.stopPropagation();if (selectionRows.length <= 1)selectionRow = file}"
					>
						<div v-if="file.category === 1 || file.category === 3" class="icon fileicon-large-video">
							<img
								:src="file.thumbs.url3"
								@error="e => e.target.hidden = true"
								style="max-width: 100%;max-height: 80px;"
							>
						</div>
						<div v-else :class="'icon ' + getFileIconClass(file, true)"></div>
						<RenameForm v-if="file.editing" :file="file" :listView="listView" @commitEdit="commitEdit"/>
						<small v-else class="text">{{ file.server_filename }}</small>
					</el-col>
					<el-col :span="1" class="action" v-if="files.length">
						<i class="el-icon-plus" @click="uploadFiles('openFile')"></i>
						<small style="display: block;">上传文件</small>
					</el-col>
				</el-row>
			</el-main>
			<el-footer height>
				<el-row type="flex" style="height: 32px;align-items: center;">
					<el-col :span="1">
						<small style="padding-left: 10px;">{{ pager.total }}项</small>
					</el-col>
					<el-col v-if="pager.count > 1" style="text-align: right">
						<el-pagination
							:page-size="pager.num"
							:page-count="pager.count"
							:current-page.sync="pager.page"
							layout="total, prev, pager, next"
							@current-change="loadFiles('paging')"
						></el-pagination>
					</el-col>
				</el-row>
			</el-footer>
		</el-container>
		<!-- 图片浏览对话框 -->
		<ImgDialog
			:images="images"
			:index="imageIndex"
			v-if="dialogVisible"
			@close="dialogVisible = false"
		/>
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
			<v-contextmenu-item @click="onClickToDelte" :disabled="menuDisableds.delete">删除</v-contextmenu-item>
			<v-contextmenu-item @click="selectionRow.editing = true" :disabled="menuDisableds.rename">重命名</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item>属性</v-contextmenu-item>
		</v-contextmenu>
		<v-contextmenu ref="tableContextMenu" :disabled="fileLoading" style="width:120px;">
			<v-contextmenu-submenu title="查看">
				<v-contextmenu-item @click="listView = false">
					<i class="el-icon-check" :style="'opacity:' + Number(!listView)"></i>
					缩略图
				</v-contextmenu-item>
				<v-contextmenu-item @click="listView = true">
					<i class="el-icon-check" :style="'opacity:' + Number(listView)"></i>
					详细信息
				</v-contextmenu-item>
			</v-contextmenu-submenu>
			<v-contextmenu-item @click="loadFiles">刷新</v-contextmenu-item>
			<v-contextmenu-submenu title="排序方式">
				<v-contextmenu-item @click="params.order = 'name'">
					<i class="el-icon-check" :style="'opacity:' + Number(params.order === 'name')"></i>
					名称
				</v-contextmenu-item>
				<v-contextmenu-item @click="params.order = 'size'">
					<i class="el-icon-check" :style="'opacity:' + Number(params.order === 'size')"></i>
					大小
				</v-contextmenu-item>
				<v-contextmenu-item @click="params.order = 'time'">
					<i class="el-icon-check" :style="'opacity:' + Number(params.order === 'time')"></i>
					修改日期
				</v-contextmenu-item>
				<v-contextmenu-item divider></v-contextmenu-item>
				<v-contextmenu-item @click="params.desc = 0">
					<i class="el-icon-check" :style="'opacity:' + (1 - params.desc)"></i>
					升序
				</v-contextmenu-item>
				<v-contextmenu-item @click="params.desc = 1">
					<i class="el-icon-check" :style="'opacity:' + params.desc"></i>
					降序
				</v-contextmenu-item>
			</v-contextmenu-submenu>
			<v-contextmenu-item>新建文件夹</v-contextmenu-item>
			<v-contextmenu-item>属性</v-contextmenu-item>
		</v-contextmenu>
	</el-container>
</template>
<script>
import ImgDialog from '@/components/dialogs/ImgDialog'
import RenameForm from '@/components/forms/RenameForm'

export default {
	name: 'Home',
	data() {
		return {
			path: '/',
			files: [],
			images: [],
			viewType: 1,
			listView: true,
			menuIndex: 1,
			tipContent: null,
			tipDisabled: true,
			fileLoading: true,
			dialogVisible: false,
			imageIndex: null,
			selectionRow: null,
			selectionRows: [],
			editingIndex: null,
			url: this.URL.list,
			search: {
				value: null,
				status: false
			},
			params: {
				desc: 0,
				order: 'name',
				showempty: 0,
				recursion: 1,
				category: null
			},
			pager: {
				page: 1,
				count: 1,
				num: 100,
				total: 0
			},
			menuDisableds: {
				open: false,
				moveTo: false,
				delete: false,
				rename: false
			}
		}
	},
	components: { ImgDialog, RenameForm },
	props: ['quota'],
	created() {
		let me = this
		me.loadFiles()
		console.log(me)
	},
	watch: {
		path(path) {
			let me = this,
				menuItem = me.MENUS[me.menuIndex]

			path = path || '/'
			me.fileLoading = true
			me.imageIndex = null
			me.selectionRow = null

			if (me.search.status) {
				me.loadFiles(me.search)
				me.search.status = false
			} else if (menuItem) {
				me.search.value = null
				if (me.menuIndex === 1) me.loadFiles()
				else if (menuItem.url) me.loadFiles(menuItem)
			} else {
				me.loadFiles()
				me.search.value = null
			}
		},
		'params.order'(prop) {
			if (prop) {
				let me = this
				me.$refs.fileTable.clearSort()
				me.$refs.fileTable.sort(me.SORT.props[prop], me.SORT.order[me.params.desc])
			}
		},
		'params.desc'(desc) {
			if (!isNaN(Number(true))) {
				let me = this
				me.$refs.fileTable.clearSort()
				me.$refs.fileTable.sort(me.SORT.props[me.params.order], me.SORT.order[desc])
			}
		},
		selectionRow(row, old) {
			let me = this

			if (old) old.editing = false
			if (row) me.selectionRows = [row]
			if (me.$refs.fileTable) {
				me.$refs.fileTable.setCurrentRow(row)
				me.files.forEach(file => me.$refs.fileTable.toggleRowSelection(file, file === row))
			}
		},
		selectionRows(rows) {
			let me = this

			if (rows && rows.length) {
				let isApp = rows.find(row => row.path === '/apps')
				if (isApp) {
					me.menuDisableds.open = false
					me.menuDisableds.delete = me.menuDisableds.rename = me.menuDisableds.moveTo = true
				} else {
					me.menuDisableds.delete = me.menuDisableds.moveTo = false
					me.menuDisableds.open = me.menuDisableds.rename = !(rows.length === 1)
					if (rows.length === 1) {
						if (rows[0].isdir) me.menuDisableds.open = false
						else me.menuDisableds.open = !me.ICONS.image.regex.test(rows[0].server_filename)
					}
				}
			} else {
				for (const key in me.menuDisableds) me.menuDisableds[key] = true
			}
		},
		listView(listView) {
			if (listView) {
				let me = this
				me.$nextTick(() => {
					me.selectionRows.forEach(row => me.$refs.fileTable.toggleRowSelection(row, true))
				})
			}
		}
	},
	computed: {
		paths: {
			set() {},
			get: me => {
				let paths = [me.ROOT]

				me.path.split('/').forEach(text => {
					if (text) {
						let path = me.path.substring(0, me.path.indexOf(text)) + text
						if (path === '/apps') text = '我的应用数据'
						paths.push({
							text: text,
							path: path
						})
					}
				})
				return paths
			}
		}
	},
	methods: {
		loadFiles(param) {
			let me = this

			me.fileLoading = true

			if (param === undefined) {
				me.url = me.URL.list
				me.params.dir = me.path
			} else if (me.MENUS.includes(param)) {
				Object.assign(me.pager, { page: 1, count: 1 })
				me.url = param.url
				me.params.category = param.category
			} else if (param === me.search) {
				me.url = me.URL.search
				me.params.key = me.search.value
			}

			me.axios
				.get(me.url, { params: Object.assign({}, me.params, me.pager) })
				.then(res => {
					me.fileLoading = false

					let files = res.data.list || res.data.info
					me.pager.total = files.length
					if (files.length === me.pager.num && me.pager.count <= me.pager.page) {
						me.pager.count++
					}

					me.images = files
						.filter(file => {
							file.editing = false
							if (file.path === '/apps') file.server_filename = '我的应用数据'
							return me.ICONS.image.regex.test(file.server_filename.toLowerCase()) && file.thumbs
						})
						.map(file => {
							return {
								id: file.fs_id,
								name: file.server_filename,
								src: file.thumbs.icon.replace(/c[0-9]*_u[0-9]*/, 'c1920_u1080')
							}
						})
					me.files = files
				})
				.catch(err => {
					console.log(err)
					me.fileLoading = false
				})
		},
		onMenuSelect(item, index) {
			let me = this
			if (me.menuIndex !== index) {
				me.menuIndex = index
				me.path = index === 1 ? '/' : `/${item.text}`
			}
		},
		uploadFiles(type) {
			let me = this
			me.showOpenDialog(
				{
					buttonLabel: '存入百度网盘',
					properties: [type, 'multiSelections'],
					filters: [{ name: '所有文件', extensions: ['*'] }]
				},
				paths => {
					console.log(paths)
				}
			)
		},
		uploadBT() {
			let me = this
			me.showOpenDialog(
				{
					title: '打开种子文件',
					buttonLabel: '存入百度网盘',
					filters: [{ name: '种子文件', extensions: ['torrent'] }]
				},
				paths => {
					console.log(paths)
				}
			)
		},
		onClickToSearch() {
			let me = this
			if (me.search.value && me.search.value.trim()) {
				me.menuIndex = 1
				me.search.status = true
				me.path = `/"${me.search.value}"的搜索结果`
			}
		},
		onSortChange({ column, prop, order }) {
			if (prop && order) {
				let me = this
				Object.assign(me.params, {
					desc: me.SORT.order.indexOf(order),
					order: Object.keys(me.SORT.props)[Object.values(me.SORT.props).indexOf(prop)]
				})
			}
		},
		onRowContextMenu(row, e) {
			let me = this
			e.stopPropagation()

			let pos = { top: e.pageY, left: e.pageX }

			if (me.selectionRows.length <= 1) me.selectionRow = row
			if (pos.top + 272 > window.innerHeight) pos.top -= 272
			if (pos.left + 122 > window.innerWidth) pos.left -= 122

			me.$refs.rowContextMenu.show(pos)
		},
		onSelectEnd(nodes) {
			let selections = []
			nodes.map(node => node.index).forEach(index => selections.push(this.files[index]))
			this.selectionRows = selections
		},
		onSelectChange(nodes, changes) {
			let me = this

			if (me.$refs.fileTable) {
				changes.forEach(node => {
					me.$refs.fileTable.toggleRowSelection(me.files[node.index], node.selected)
				})
			} else {
				let selections = []
				nodes.forEach(node => selections.push(me.files[node.index]))
				me.selectionRows = selections
			}
		},
		onSelectionChange(selections) {
			this.selectionRows = selections
		},
		/**
		 * 打开文件
		 */
		onClickToOpen(row) {
			let me = this
			if (row.isdir) me.path = row.path
			else if (me.ICONS.image.regex.test(row.server_filename.toLowerCase())) {
				me.imgLoading = true
				me.dialogVisible = true
				me.imageIndex = me.images.findIndex(image => image.id === row.fs_id)
			}
		},
		/**
		 * 删除文件
		 */
		onClickToDelte() {
			let me = this

			if (!me.selectionRows.length) return me.$notify.warning('请至少选择一个文件')

			me.$confirm(
				`确定删除这${me.selectionRows.length}个文件或文件夹吗？<br>删除的文件可在10天内通过回收站还原`,
				'提示',
				{
					type: 'warning',
					dangerouslyUseHTMLString: true,
					callback(action, box) {
						box.confirmButtonLoading = false
						if (action === 'confirm') me.$message.success('删除成功！')
					},
					beforeClose: (action, box, done) => {
						if (action === 'confirm') {
							box.confirmButtonLoading = true
							box.confirmButtonText = '删除中...'
							setTimeout(() => {
								done()
								for (const row of me.selectionRows) {
									me.files.splice(me.files.indexOf(row), 1)
								}
							}, 3000)
						} else {
							done()
						}
					}
				}
			)
		},
		/**
		 * 提交编辑
		 */
		commitEdit() {}
	}
}
</script>
