<template>
	<el-container>
		<el-aside class="nav-aside">
			<el-menu router class="nav-menu" :default-active="$route.query.text || '全部文件'">
				<el-menu-item
					:key="item.text"
					:index="item.text"
					:route="{ query : item}"
					v-for="item in $constant.CATEGORY"
				>
					<i :class="item.icon">
						<svg-icon v-if="item.svg" :name="item.svg" w="1em"></svg-icon>
					</i>
					<small slot="title">{{ item.text }}</small>
				</el-menu-item>
			</el-menu>
			<el-progress
				color="#67C23A"
				:stroke-width="8"
				class="nav-progress"
				:percentage="quota.used / quota.total * 100"
				:format="p => quota.usedText + '/' + quota.totalText"
			></el-progress>
		</el-aside>
		<el-container ref="main_view" class="main-view">
			<el-header height="auto">
				<div v-if="visible.share" class="toolbar">
					<el-button
						plain
						size="small"
						@click="onClickToCopyShareURL(currentRow)"
						:disabled="selectionRows.length !== 1 || currentRow.expiredType === -1"
					>
						<svg-icon name="copy" w="1em"></svg-icon>复制链接
					</el-button>
					<el-button
						plain
						size="small"
						:disabled="selectionRows.length === 0"
						@click="onClickToUnshare(selectionRows)"
					>
						<svg-icon name="block" w="1em"></svg-icon>取消分享
					</el-button>
					<el-button plain size="small" icon="el-icon-refresh" @click="loadFiles">刷新</el-button>
				</div>
				<div v-else-if="visible.recycle" class="toolbar">
					<el-button
						plain
						size="small"
						icon="el-icon-delete"
						@click="onClickToRealDelete"
						:disabled="selectionRows.length === 0"
					>彻底删除</el-button>
					<el-button plain size="small" :disabled="selectionRows.length === 0" @click="onClickToRestore">
						<svg-icon name="undo" w="1em"></svg-icon>还原文件
					</el-button>
					<el-button
						plain
						size="small"
						icon="el-icon-delete"
						@click="onClickToEmpty"
						:disabled="files.length === 0"
					>清空回收站</el-button>
					<el-button plain size="small" icon="el-icon-refresh" @click="loadFiles">刷新</el-button>
				</div>
				<template v-else>
					<div class="toolbar">
						<el-button
							plain
							size="small"
							class="upload-btn"
							icon="el-icon-upload2"
							@click="$util.showMenu(menus.upload,'.upload-btn')"
						>上传</el-button>
						<el-button
							plain
							size="small"
							icon="el-icon-download"
							:disabled="selectionRows.length === 0"
						>下载</el-button>
						<el-button
							plain
							size="small"
							icon="el-icon-share"
							:disabled="selectionRows.length === 0 || disabled.menu.share"
						>分享</el-button>
						<el-button
							plain
							size="small"
							icon="el-icon-delete"
							@click="onClickToDelte"
							:disabled="disabled.menu.delete"
						>删除</el-button>
						<el-button plain size="small" icon="el-icon-plus" @click="createNewFolder">新建文件夹</el-button>
						<el-button-group>
							<el-button plain size="small" class="offline-download-btn">
								<svg-icon name="cloud-download" w="1em"></svg-icon>离线下载
							</el-button>
							<el-button
								plain
								size="small"
								icon="el-icon-arrow-down"
								style="padding: 9px 5px;"
								@click="$util.showMenu(menus.offlineDownload,'.offline-download-btn')"
							></el-button>
						</el-button-group>
						<el-button-group>
							<el-button
								plain
								size="small"
								icon="el-icon-more"
								class="other-more-btn"
								:disabled="selectionRows.length === 0"
							>更多</el-button>
							<el-button
								plain
								size="small"
								icon="el-icon-arrow-down"
								style="padding: 9px 5px;"
								:disabled="selectionRows.length === 0"
								@click="$util.showMenu(menus.other,'.other-more-btn')"
							></el-button>
						</el-button-group>
						<el-button plain size="small" @click="$util.test">测试按钮</el-button>
						<el-button
							plain
							@click="listView = !listView"
							:title="listView ? '切换到缩略图模式' : '切换到列表模式'"
							style="float: right;border: none;padding: 5px;"
						>
							<svg-icon v-if="listView" name="card" w="20"></svg-icon>
							<svg-icon v-else name="bars" w="20"></svg-icon>
						</el-button>
					</div>
					<el-row type="flex" align="middle" class="action-path">
						<el-col style="width: auto;">
							<el-button plain icon="el-icon-arrow-left"></el-button>
							<el-button plain icon="el-icon-arrow-right"></el-button>
							<el-button
								plain
								icon="el-icon-caret-bottom history-btn-icon"
								@click="$util.showMenu(menus.history,'.history-btn-icon')"
							></el-button>
							<el-button plain @click="loadFiles" :disabled="loading.files" icon="el-icon-refresh"></el-button>
						</el-col>
						<el-col tag="span" class="split"></el-col>
						<el-col style="flex: 1;">
							<el-breadcrumb separator-class="el-icon-arrow-right">
								<el-breadcrumb-item
									:key="item.text"
									v-for="item in paths"
									:to="{query: {path: item.path, text: '全部文件'}}"
								>{{ item.text }}</el-breadcrumb-item>
							</el-breadcrumb>
						</el-col>
						<el-col tag="span" class="split"></el-col>
						<el-col style="width: auto;margin-right: 5px;">
							<!-- 使用v-model绑定数据，事件处理频繁，输入卡顿，故不使用 -->
							<input
								ref="search_input"
								class="search-input"
								placeholder="搜索我的网盘文件"
								@keyup.enter="onClickToSearch"
							>
						</el-col>
						<el-col style="width: auto;">
							<el-button plain icon="el-icon-search" @click="onClickToSearch"></el-button>
						</el-col>
					</el-row>
				</template>
			</el-header>
			<el-bigdata-table
				:data="files"
				height="100%"
				ref="file_table"
				v-loading="loading.files"
				highlight-current-row
				@sort-change="onSortChange"
				@row-dblclick="onClickToOpen"
				@select-change="onSelectChange"
				v-if="visible.share || listView"
				@expand-change="toggleExpandRow"
				:expand-row-keys="expandRowKeys"
				@row-contextmenu="onRowContextMenu"
				@selection-change="onSelectionChange"
				:row-key="row => row.fs_id || row.shareId"
				v-selectable="{selector: '.el-table__row'}"
				@header-contextmenu="(col, e) => e.stopPropagation()"
				@contextmenu.native="$util.showMenu(menus.table)"
				@row-click="row => {currentRow = row; toggleExpandRow(row)}"
				:row-class-name="({row}) => selectionRows.includes(row) ? 'selected-row' : ''"
			>
				<el-table-column type="selection" align="right" width="25" :key="Math.random()"></el-table-column>
				<el-table-column
					width="1"
					type="expand"
					v-if="visible.share"
					:key="Math.random()"
					class-name="share-expand"
				>
					<template slot-scope="{ row }">
						<div>
							<span>&nbsp;链接：</span>
							<el-button
								type="text"
								style="width: 350px;text-align: left;"
								@click="$electron.shell.openExternal(row.shortlink)"
							>{{ row.shortlink }}</el-button>
							<span
								style="width: 100px;display: inline-block;"
							>{{ row.passwd === '0' ? '' : `提取码：${row.passwd}` }}</span>
							<el-button plain style="width: 80px;" @click="onClickToCopyShareURL(row)">复制</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					width="25"
					align="center"
					v-if="visible.share"
					:key="Math.random()"
					class-name="share-lock"
				>
					<template slot-scope="{}">
						<svg-icon name="lock" w="1.3em" color="#a2a5ab"></svg-icon>
					</template>
				</el-table-column>
				<el-table-column
					sortable
					label="文件名"
					min-width="300"
					:key="Math.random()"
					prop="server_filename"
					:class-name="visible.share ? 'filename-column' : ''"
				>
					<template slot-scope="{ row }">
						<div :title="row.server_filename" style="display: flex;align-items: center;">
							<img :src="$util.getFileIcon(row)" style="margin-right: 5px;">
							<template v-if="visible.share">
								<span
									class="share-filename"
									:style="{color: row.expiredType === -1 ? '#999999' : 'initial'}"
								>
									{{ row.server_filename }}
									{{ row.expiredType !== -1 && row.fsIds.length > 1 ? '等' : '' }}
								</span>
								<el-button-group class="share-btn-group">
									<el-button
										plain
										title="复制链接信息"
										v-if="row.expiredType !== -1"
										@click="onClickToCopyShareURL(row)"
									>
										<svg-icon name="copy" w="1em"></svg-icon>
									</el-button>
									<el-button plain title="取消链接分享" @click="onClickToUnshare([row])">
										<svg-icon name="block" w="1em"></svg-icon>
									</el-button>
								</el-button-group>
							</template>
							<template v-else>
								<RenameForm v-if="row.editing" :file="row" :listView="listView" @commitEdit="commitEdit"/>
								<el-button
									v-else
									type="text"
									class="filename"
									@click="onClickToOpen(row)"
								>{{ row.server_filename }}</el-button>
							</template>
						</div>
					</template>
				</el-table-column>
				<template v-if="visible.share">
					<el-table-column sortable prop="ctime" min-width="150" label="分享时间" :key="Math.random()">
						<template slot-scope="{ row }">{{ new Date(row.ctime * 1000).format('yyyy-MM-dd HH:mm:ss') }}</template>
					</el-table-column>
					<el-table-column label="失效时间" min-width="100" :key="Math.random()">
						<template slot-scope="{ row }">{{ expiredCalculation(row) }}</template>
					</el-table-column>
					<el-table-column prop="vCnt" label="浏览次数" min-width="70" :key="Math.random()"></el-table-column>
					<el-table-column prop="tCnt" label="访问次数" min-width="70" :key="Math.random()"></el-table-column>
					<el-table-column prop="dCnt" label="下载次数" min-width="70" :key="Math.random()"></el-table-column>
				</template>
				<template v-else>
					<el-table-column
						sortable
						min-width="150"
						label="修改时间"
						prop="server_mtime"
						:key="Math.random()"
					>
						<template
							slot-scope="{ row }"
						>{{ new Date(row.server_mtime * 1000).format('yyyy-MM-dd HH:mm:ss') }}</template>
					</el-table-column>
					<el-table-column sortable label="大小" prop="size" min-width="100" :key="Math.random()">
						<template slot-scope="{ row }">{{ row.isdir ? '-' : $util.transferFileSize(row.size) }}</template>
					</el-table-column>
				</template>
			</el-bigdata-table>
			<el-row
				v-else
				class="thumb-view"
				v-loading="loading.files"
				:flex="files.length === 0"
				@select-change="onSelectChange"
				v-selectable="{ selector : '.thumb-item' }"
				@contextmenu.native="$util.showMenu(menus.table)"
			>
				<el-col v-if="!loading.files && files.length === 0">
					<small style="color: #909399;">暂无数据</small>
					<br>
					<br>
					<el-upload
						multiple
						v-if="visible.upload"
						:show-file-list="false"
						:action="$constant.API.upload"
					>
						<el-button type="primary">上传文件</el-button>
					</el-upload>
				</el-col>
				<el-col
					v-else
					:span="1"
					:key="file.fs_id"
					:data-row-index="i"
					v-for="(file, i) in files"
					:title="getFileNameTitle(file)"
					@click.native="currentRow = file"
					@dblclick.native="onClickToOpen(file)"
					@contextmenu.native="e => onRowContextMenu(file, e)"
					:class="{
						'thumb-item': true,
						'selected': selectionRows.includes(file)
					}"
				>
					<div class="icon">
						<img
							:src="file.thumbs.url3"
							v-if="file.category === 1 || file.category === 3"
							@error="e => e.target.src = $util.getFileIcon(file, 'Big')"
						>
						<img v-else :src="$util.getFileIcon(file, 'Big')">
					</div>
					<RenameForm
						:file="file"
						:listView="listView"
						@commitEdit="commitEdit"
						v-if="file.editing && selectionRows.includes(file)"
					/>
					<span v-else class="text">{{ file.server_filename }}</span>
				</el-col>
				<el-col :span="1" class="action" v-if="visible.upload && files.length">
					<i class="el-icon-plus" @click="uploadFiles('openFile')"></i>
					<span>上传文件</span>
				</el-col>
			</el-row>
			<el-footer height>
				<el-row type="flex" style="height: 32px;align-items: center;">
					<el-col :span="2">
						<small style="padding-left: 10px;">{{ pager.total }}项</small>
					</el-col>
					<el-col v-if="pager.count > 1" style="text-align: right">
						<el-pagination
							:page-size="pager.num"
							:page-count="pager.count"
							:current-page.sync="pager.page"
							layout="total, prev, pager, next"
							@current-change="loadFiles"
						></el-pagination>
					</el-col>
				</el-row>
			</el-footer>
			<!-- 图片浏览对话框 -->
			<img-preview
				:images="images"
				:index="imageIndex"
				v-if="visible.imgPreview"
				@close="visible.imgPreview = false"
			/>
		</el-container>
		<el-dialog :visible.sync="visible.pathChooser" custom-class="path-chooser-dialog">
			<span slot="title">选择网盘路径</span>
			<el-tree
				lazy
				accordion
				node-key="path"
				:props="treeProps"
				:load="loadFolders"
				highlight-current
				:expand-on-click-node="false"
				:default-expanded-keys="['/']"
			>
				<div slot-scope="{ node, data }" style="display: contents;">
					<img :src="data.icon" style="margin-right: 5px;">
					<small>{{ node.label }}</small>
				</div>
			</el-tree>
			<div slot="footer">
				<el-button style="float:left;">新建文件夹</el-button>
				<el-button type="primary" @click="visible.pathChooser = false">确 定</el-button>
				<el-button @click="visible.pathChooser = false">关 闭</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>
<script>
import RenameForm from '@/components/forms/RenameForm'

export default {
	name: 'Home',
	data() {
		const me = this
		return {
			path: '/',
			files: [],
			images: [],
			folders: [],
			listView: true,
			tipContent: null,
			imageIndex: null,
			currentRow: null,
			selectionRows: [],
			expandRowKeys: [],
			editingIndex: null,
			url: me.$constant.API.list,
			treeProps: {
				label(data) {
					if (data.path === '/') return '全部文件'
					if (data.path === '/apps') return '我的应用数据'
					return data.path.substr(data.path.lastIndexOf('/') + 1)
				},
				isLeaf(data) {
					data.path = data.path || ''
					data.icon = 'static/images/FileType/Small/FolderType.png'
					if (data.path.startsWith('/apps')) data.icon = 'static/images/FileType/Small/Apps.png'
					return Boolean(data.dir_empty)
				}
			},
			loading: {
				files: false,
				folders: false
			},
			visible: {
				share: false,
				upload: true,
				imgPreview: false,
				recycle: false,
				pathChooser: false
			},
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
			disabled: {
				menu: {
					open: false,
					share: false,
					moveTo: false,
					delete: false,
					rename: false
				}
			},
			menus: {
				upload: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '上传文件',
						click: () => me.uploadFiles('openFile')
					},
					{
						label: '上传文件夹',
						click: () => me.uploadFiles('openDirectory')
					}
				]),
				offlineDownload: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '新建普通下载'
					},
					{
						label: '新建BT任务',
						icon: 'static/images/torrent.png',
						click: () => me.uploadBT()
					},
					{
						label: '查看下载列表',
						click: () => me.$emit('activeTab', 'offline-download')
					}
				]),
				other: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '复制到…'
					},
					{
						id: 'moveTo',
						label: '移动到…',
						click: () => (me.visible.pathChooser = true)
					},
					{
						id: 'rename',
						label: '重命名…',
						click: () => (me.currentRow.editing = true)
					},
					{
						label: '移入隐藏空间'
					},
					{
						enabled: false,
						label: '文档历史版本'
					}
				]),
				history: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '我的网盘',
						click: () => (me.path = '/')
					}
				]),
				row: me.$electron.remote.Menu.buildFromTemplate([
					{
						id: 'open',
						label: '打开',
						click: () => me.onClickToOpen(me.currentRow)
					},
					{
						id: 'share',
						label: '分享'
					},
					{ type: 'separator' },
					{
						label: '下载'
					},
					{
						id: 'shareDownload',
						label: '分享并下载'
					},
					{ type: 'separator' },
					{
						label: '复制到...'
					},
					{
						id: 'moveTo',
						label: '移动到...',
						click: () => (me.visible.pathChooser = true)
					},
					{ type: 'separator' },
					{
						id: 'delete',
						label: '删除',
						click: () => me.onClickToDelte()
					},
					{
						id: 'rename',
						label: '重命名',
						click: () => (me.currentRow.editing = true)
					},
					{ type: 'separator' },
					{
						label: '属性'
					}
				]),
				table: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '查看',
						submenu: [
							{
								id: 'thumbnail',
								label: '缩略图',
								type: 'checkbox',
								click: item => {
									me.listView = false
									item.checked = true
									item.menu.getMenuItemById('list').checked = false
								}
							},
							{
								id: 'list',
								checked: true,
								label: '详细信息',
								type: 'checkbox',
								click: item => {
									me.listView = true
									item.checked = true
									item.menu.getMenuItemById('thumbnail').checked = false
								}
							}
						]
					},
					{
						label: '刷新',
						icon: 'static/images/refresh.png',
						click: () => me.loadFiles()
					},
					{
						label: '排序方式',
						submenu: [
							{
								label: '名称',
								type: 'checkbox',
								click: () => (me.params.order = 'name')
							},
							{
								label: '大小',
								type: 'checkbox',
								click: () => (me.params.order = 'size')
							},
							{
								label: '修改日期',
								type: 'checkbox',
								click: () => (me.params.order = 'time')
							},
							{ type: 'separator' },
							{
								label: '升序',
								type: 'checkbox',
								click: () => (me.params.desc = 0)
							},
							{
								label: '降序',
								type: 'checkbox',
								click: () => (me.params.desc = 1)
							}
						]
					},
					{
						label: '新建文件夹',
						click: () => me.createNewFolder()
					},
					{
						label: '属性'
					}
				])
			}
		}
	},
	components: { RenameForm },
	props: ['quota'],
	mounted() {
		const me = this,
			query = JSON.parse(localStorage.home_query || '{}')

		console.log(me)
		if (Object.isEmpty(query) || !Object.isEmpty(me.$route.query)) me.loadFiles()
		else me.$router.push({ query })
	},
	watch: {
		$route(route) {
			const me = this
			me.pager.page = me.pager.count = 1
			me.loadFiles()
			localStorage.home_query = JSON.stringify(route.query || {})
		},
		'params.order'(prop) {
			if (prop) {
				// const me = this
				// me.$refs.file_table.clearSort()
				// me.$refs.file_table.sort(me.$constant.SORT.props[prop], me.$constant.SORT.order[me.params.desc])
			}
		},
		'params.desc'(desc) {
			// if (!isNaN(Number(desc))) {
			// 	const me = this
			// me.$refs.file_table.clearSort()
			// me.$refs.file_table.sort(me.$constant.SORT.props[me.params.order], me.$constant.SORT.order[desc])
			// }
		},
		currentRow(row, old) {
			const me = this
			if (old) old.editing = false
			if (row) {
				if (me.$refs.file_table) {
					me.$refs.file_table.clearSelection()
					me.$refs.file_table.toggleRowSelection(row)
				} else me.selectionRows = [row]
			}
		},
		selectionRows(rows) {
			const me = this
			if (rows && rows.length) {
				if (rows.length === 1) me.currentRow = rows[0]
				let isApp = rows.find(row => row.path === '/apps')
				if (isApp) {
					Object.assign(me.disabled.menu, {
						open: false,
						share: true,
						delete: true,
						rename: true,
						moveTo: true
					})
				} else {
					me.disabled.menu.open = me.disabled.menu.rename = !(rows.length === 1)
					Object.assign(me.disabled.menu, { share: false, delete: false, moveTo: false })
					if (rows.length === 1) {
						if (rows[0].isdir) me.disabled.menu.open = false
						else me.disabled.menu.open = !me.$constant.ICONS.image.regex.test(rows[0].server_filename)
					}
				}
			} else {
				me.currentRow = null
				for (const key in me.disabled.menu) me.disabled.menu[key] = true
			}
		},
		listView(value) {
			const me = this
			if (value) {
				me.$nextTick(() => {
					me.selectionRows.forEach(row => me.$refs.file_table.toggleRowSelection(row, true))
				})
			}

			me.menus.table.getMenuItemById('list').checked = value
			me.menus.table.getMenuItemById('thumbnail').checked = !value
		},
		'disabled.menu': {
			deep: true,
			handler(obj) {
				const me = this
				let item = {}
				for (const key in obj) {
					item = me.menus.other.getMenuItemById(key) || {}
					item.enabled = !obj[key]
					item = me.menus.row.getMenuItemById(key) || {}
					item.enabled = !obj[key]
					if (key === 'share') {
						me.menus.row.getMenuItemById('shareDownload').enabled = !obj[key]
					}
				}
			}
		},
		'visible.pathChooser'(visible) {}
	},
	computed: {
		paths: {
			set() {},
			get: me => {
				let paths = [me.$constant.ROOT]

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
		loadFiles() {
			const me = this,
				query = me.$route.query

			me.files = []
			me.imageIndex = null
			me.loading.files = true
			me.selectionRows = []
			me.expandRowKeys = []
			me.visible.upload = false

			if (query.path) {
				me.path = query.path
				me.params.dir = me.path
				me.visible.upload = true
				me.url = me.$constant.API.list
			} else if (query.url) {
				me.url = query.url
				me.params.category = query.category
				me.visible.share = me.$constant.API.share === query.url
				me.visible.recycle = me.$constant.API.recycle === query.url
				me.path = query.text === '全部文件' ? '/' : `/${query.text}`
			} else if (query.search) {
				me.params.dir = '/'
				me.params.key = query.search
				me.url = me.$constant.API.search
				me.path = `/"${query.search}"的搜索结果`
				me.$refs.search_input.value = query.search
			} else return

			me.axios
				.get(me.url, { params: Object.assign({}, me.params, me.pager) })
				.then(res => {
					me.loading.files = false

					let files = res.data.list || res.data.info
					me.pager.total = files.length
					if (files.length === me.pager.num && me.pager.count <= me.pager.page) {
						me.pager.count++
					}

					me.images = files
						.filter(file => {
							file.editing = false

							if (me.visible.share) {
								file.path = file.typicalPath
								file.server_filename = file.path.substring(file.path.lastIndexOf('/') + 1)
								if (file.typicalCategory === -1) file.isdir = 1
							}

							if (file.path === '/apps') file.server_filename = '我的应用数据'
							return file.category === 3
						})
						.map(file => {
							return {
								id: file.fs_id,
								alt: file.server_filename,
								title: file.server_filename,
								name: file.server_filename,
								thumb: file.thumbs.icon,
								src: file.thumbs.icon.replace(/c[0-9]*_u[0-9]*/, 'c1920_u1080')
							}
						})

					me.files = files
				})
				.catch(err => {
					console.error(err)
					me.loading.files = false
				})
		},
		loadFolders(node, resolve) {
			if (node.level === 0) return resolve([{ path: '/' }])

			const me = this
			me.axios
				.get(me.$constant.API.list, {
					params: {
						desc: 0,
						folder: 1,
						showempty: 0,
						order: 'name',
						dir: node.data.path
					}
				})
				.then(res => {
					resolve(res.data.list)
				})
				.catch(err => {
					console.error(err)
				})
		},
		uploadFiles(type) {
			const me = this
			me.$electron.remote.dialog.showOpenDialog(
				me.$electron.remote.getCurrentWindow(),
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
			const me = this
			me.$electron.remote.dialog.showOpenDialog(
				me.$electron.remote.getCurrentWindow(),
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
			const me = this,
				search = me.$refs.search_input.value
			if (search.trim()) {
				me.$router.push({
					query: { search }
				})
			}
		},
		onSortChange({ column, prop, order }) {
			if (prop && order) {
				const me = this
				Object.assign(me.params, {
					desc: me.$constant.SORT.order.indexOf(order),
					order: Object.keys(me.$constant.SORT.props)[Object.values(me.$constant.SORT.props).indexOf(prop)]
				})
			}
		},
		onRowContextMenu(row) {
			const me = this
			if (me.selectionRows.length <= 1) me.currentRow = row
			me.$nextTick(() => me.$util.showMenu(me.menus.row))
		},
		onSelectEnd(nodes) {
			let selections = []
			nodes.map(node => node.index).forEach(index => selections.push(this.files[index]))
			this.selectionRows = selections
		},
		onSelectChange(nodes, changes) {
			const me = this
			if (me.$refs.file_table) {
				changes.forEach(node => {
					me.$refs.file_table.toggleRowSelection(me.files[node.dataset.rowIndex], Boolean(node.selected))
				})
			} else {
				changes.forEach(node => {
					const row = me.files[node.dataset.rowIndex]

					if (Boolean(node.selected)) {
						if (!me.selectionRows.includes(row)) {
							me.selectionRows.push(row)
						}
					} else {
						const index = me.selectionRows.indexOf(row)
						me.selectionRows.splice(index, 1)
					}
				})
			}
		},
		onSelectionChange(selections) {
			this.selectionRows = selections
		},
		/**
		 * 打开文件
		 */
		onClickToOpen(row) {
			const me = this
			if (me.visible.share) return
			if (row.isdir) {
				me.$router.push({ query: { path: (me.path = row.path) } })
			} else if (me.$constant.ICONS.image.regex.test(row.server_filename.toLowerCase())) {
				me.imgLoading = true
				me.visible.imgPreview = true
				me.imageIndex = me.images.findIndex(image => image.id === row.fs_id)
			}
		},
		/**
		 * 删除文件
		 */
		onClickToDelte() {
			const me = this

			if (!me.selectionRows.length) return me.$notify.warning('请至少选择一个文件')

			me.$util
				.confirm(
					'系统提示',
					'删除的文件可在10天内通过回收站还原',
					`确定删除这${me.selectionRows.length}个文件或文件夹吗？`
				)
				.then(rs => {
					console.log(rs)
					if (rs) {
						setTimeout(() => {
							for (const row of me.selectionRows) {
								me.files.splice(me.files.indexOf(row), 1)
							}
							me.$message.success('删除成功！')
						}, 3000)
					}
				})
		},
		/**
		 * 删除回收站文件
		 */
		onClickToRealDelete() {
			const me = this

			if (!me.selectionRows.length) return me.$notify.warning('请至少选择一个文件')

			me.$util.confirm('系统提示', '文件删除后将无法恢复', '您确认要彻底删除所选文件吗？').then(rs => {
				if (rs) {
					setTimeout(() => {
						for (const row of me.selectionRows) {
							me.files.splice(me.files.indexOf(row), 1)
						}
						me.$message.success('删除成功！')
					}, 3000)
				}
			})
		},
		/**
		 * 还原文件
		 */
		onClickToRestore() {
			const me = this

			if (!me.selectionRows.length) return me.$notify.warning('请至少选择一个文件')

			me.$util.confirm('系统提示', '文件将被还原至原先目录', '确认还原选中的文件？').then(rs => {
				if (rs) {
					setTimeout(() => {
						for (const row of me.selectionRows) {
							me.files.splice(me.files.indexOf(row), 1)
						}
						me.$message.success('还原成功！')
					}, 3000)
				}
			})
		},
		/**
		 * 清空回收站
		 */
		onClickToEmpty() {
			const me = this

			me.$util.confirm('系统提示', '此操作不可逆', '确认清空回收站？').then(rs => {
				if (rs) {
					setTimeout(() => {
						me.files = []
						me.$message.success('清空成功！')
					}, 3000)
				}
			})
		},
		/**
		 * 取消分享
		 */
		onClickToUnshare(rows) {
			const me = this

			if (!Array.isArray(rows) || rows.length === 0) return me.$notify.warning('请至少选择一个文件')

			me.$util.confirm('系统提示', '取消分享链接将失效', '确定取消分享吗？').then(rs => {
				if (rs) {
					setTimeout(() => {
						for (const row of rows) {
							me.files.splice(me.files.indexOf(row), 1)
						}
						me.$message.success('取消分享成功！')
					}, 3000)
				}
			})
		},
		/**
		 * 提交编辑
		 */
		commitEdit() {},
		getFileNameTitle(file) {
			let title = ['名称：', file.server_filename]
			if (!file.isdir) title = title.concat('\n大小：', this.$util.transferFileSize(file.size))
			title = title.concat('\n修改时间：', new Date(file.server_mtime * 1000).format('yyyy-MM-dd HH:mm:ss'))
			return title.join('')
		},
		createNewFolder() {
			const me = this

			me.currentRow = {
				size: 0,
				isdir: 1,
				editing: true,
				server_filename: '新建文件夹',
				path: me.path + '/新建文件夹',
				server_mtime: Math.round(Date.now() / 1000)
			}

			me.files.unshift(me.currentRow)
		},
		expiredCalculation(file) {
			switch (file.expiredType) {
				case 0:
					let days = file.expiredTime / (24 * 60 * 60)
					if (days < 1) return Math.round(file.expiredTime / 3600) + '小时后'
					return Math.round(days) + '天后'

				case 1:
					return '永久有效'

				default:
					return '已失效'
			}
		},
		toggleExpandRow(row) {
			const me = this
			if (me.visible.share) {
				if (row.expiredType === -1) return (me.expandRowKeys = [])
				if (me.expandRowKeys.includes(row.shareId)) me.expandRowKeys = []
				else me.expandRowKeys = [row.shareId]
			}
		},
		onClickToCopyShareURL(file) {
			this.$electron.clipboard.writeText(
				file.passwd === '0' ? file.shortlink : `链接：${file.shortlink} 提取码：${file.passwd}`
			)
			this.$message.success({
				message: '已复制到剪贴板',
				iconClass: 'el-icon-check',
				customClass: 'url-copy-success'
			})
		}
	}
}
</script>
