<template>
	<el-container>
		<el-header height>
			<div class="toolbar">
				<el-button plain size="small" @click="listView = !listView">试图切换</el-button>
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
						:disabled="tableLoading"
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
						v-model="searchValue"
						prefix-icon="split"
						placeholder="搜索我的网盘文件"
						@keyup.enter.native="onClickToSearch"
					>
						<i slot="suffix" class="el-input__icon el-icon-search" @click="onClickToSearch"></i>
					</el-input>
				</el-col>
			</el-row>
		</el-header>
		<el-main style="position: relative;">
			<el-table
				:data="files"
				height="100%"
				ref="fileTable"
				v-if="listView"
				highlight-current-row
				v-loading="tableLoading"
				style="position: absolute;"
				@sort-change="onSortChange"
				@row-dblclick="onClickToOpen"
				@row-contextmenu="onRowContextMenu"
				@selection-change="onSelectionChange"
				@row-click="row => selectionRow = row"
				@header-contextmenu="(col, e) => e.stopPropagation()"
			>
				<el-table-column type="selection" width="30"></el-table-column>
				<el-table-column sortable label="文件名" min-width="500" prop="server_filename">
					<template slot-scope="{ row }">
						<div :class="getFileIconClass(row)" style="padding-left: 35px;">
							<el-form
								inline
								status-icon
								:model="row"
								ref="renameForm"
								v-if="row.editing"
								:show-message="false"
								@validate="onValidate"
								@submit.native.prevent
							>
								<el-form-item
									required
									prop="server_filename"
									:rules="RULES.fileName"
									style="margin-bottom: 0px;"
									@keyup.enter.native="commitEdit(row)"
									@dblclick.native="e => e.stopPropagation()"
									@contextmenu.native="e => e.stopPropagation()"
								>
									<el-tooltip ref="errorTip" manual transition :content="tipContent" :disabled="tipDisabled">
										<el-input
											ref="renameInput"
											style="min-width: 300px;"
											placeholder="请输入文件名称"
											v-model="row.server_filename"
										></el-input>
									</el-tooltip>
								</el-form-item>
								<el-button type="success" icon="el-icon-check" @click="commitEdit(row)"></el-button>
								<el-button type="danger" icon="el-icon-close" @click="cancelEdit(row)"></el-button>
							</el-form>
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
			<el-row v-else class="thumb-view">
				<el-col
					:span="1"
					v-for="file in files"
					:key="file.fs_id"
					class="thumb-item"
					:selected="file === selectionRow"
					@click.native="selectionRow = file"
				>
					<div :class="'icon ' + getFileIconClass(file, true)"></div>
					<small class="text">{{ file.server_filename }}</small>
				</el-col>
			</el-row>
		</el-main>
	</el-container>
</template>

<script>
export default {
	data() {
		return {
			path: '/',
			files: [],
			images: [],
			listView: true,
			menuIndex: 1,
			tipContent: null,
			tipDisabled: true,
			tableLoading: true,
			dialogVisible: false,
			imageIndex: null,
			searchValue: null,
			selectionRow: null,
			selectionRows: [],
			editingIndex: null,
			url: this.URL.list,
			// paths: [this.ROOT],
			// quota: { used: 0, total: 1 },
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
	components: {
		ImgDialog: () => import('@/components/dialogs/ImgDialog')
	},
	props: ['quota'],
	created() {
		let me = this
		me.loadFiles()
		// console.log(me)
	},
	watch: {
		path(path) {
			let me = this
			path = path || '/'
			me.tableLoading = true
			me.imageIndex = null
			me.selectionRow = null
			me.loadFiles()
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
			if (me.$refs.fileTable) {
				if (row) {
					let fileName = row.server_filename
					me.$refs.fileTable.setCurrentRow(row)
				}
				if (old) me.cancelEdit(old)
				me.files.forEach(file => me.$refs.fileTable.toggleRowSelection(file, file === row))
			}
		},
		selectionRows(rows) {
			let me = this
			if (rows.length) {
				me.menuDisableds.rename = rows.length > 1
				if (rows.length === 1) {
					let fileName = rows[0].server_filename
					if (rows[0].isdir) {
						me.menuDisableds.open = false
						me.menuDisableds.delete = me.menuDisableds.rename = me.menuDisableds.moveTo = fileName === 'apps'
					} else {
						me.menuDisableds.open = !me.ICONS.image.regex.test(fileName)
					}
				}
			} //else me.selectionRow = null
		}
	},
	computed: {
		paths: {
			set() {},
			get: me => {
				let paths = [me.ROOT]

				me.path.split('/').forEach(text => {
					if (text) {
						paths.push({
							text: text,
							path: me.path.substring(0, me.path.indexOf(text)) + text
						})
					}
				})
				return paths
			}
		}
	},
	methods: {
		onMenuSelect(index, type) {
			let me = this
			if (me.menuIndex !== index) {
				me.menuIndex = index
				me.loadFiles(type)
			}
		},
		onValidate(prop, valid, error) {
			this.tipDisabled = valid
			if (error) this.tipContent = error
			this.$refs.errorTip.showPopper = !valid
		},
		onClickToSearch() {
			let me = this
			if (me.searchValue && me.searchValue.trim()) me.loadFiles('search')
		},
		loadFiles(param) {
			let me = this

			me.tableLoading = true
			if (param === undefined) {
				me.url = me.URL.list
				me.params.dir = me.path
			} else if (me.MENUS.includes(param)) {
				Object.assign(me.pager, { page: 1, count: 1 })
				me.url = param.url
				me.params.category = param.category
				if (param.category) {
					me.paths = [me.ROOT, param]
				} else me.paths = [me.ROOT]
			} else if (param === 'search') {
				me.url = me.URL.search
				me.params.key = me.searchValue
				me.paths = [me.ROOT, { text: `"${me.searchValue}"的搜索结果` }]
			}

			me.axios
				.get(me.url, { params: Object.assign({}, me.params, me.pager) })
				.then(res => {
					me.tableLoading = false

					let files = res.data.list || res.data.info
					me.pager.total = files.length
					if (files.length === me.pager.num && me.pager.count <= me.pager.page) {
						me.pager.count++
					}

					me.images = files
						.filter(file => {
							file.editing = false
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
					me.tableLoading = false
				})
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
		 * 开始编辑
		 */
		startEdit() {
			let me = this
			if (me.selectionRow) {
				me.selectionRow.editing = true
				setTimeout(() => {
					me.$refs.renameInput.focus()
					if (me.selectionRow.isdir) me.$refs.renameInput.select()
					else me.$refs.renameInput.$refs.input.setSelectionRange(0, me.selectionRow.server_filename.lastIndexOf('.'))
				})
			}
		},
		/**
		 * 提交编辑
		 */
		commitEdit(row) {
			let me = this
			if (me.$refs.renameForm) {
				me.$refs.renameForm.validate(valid => {
					if (valid) {
						me.tipDisabled = true
						me.selectionRow.editing = false
					}
				})
			}
		},
		/**
		 * 取消编辑
		 */
		cancelEdit(row) {
			let me = this
			if (row && me.$refs.renameForm) {
				row.editing = false
				me.tipDisabled = true
				me.$refs.renameForm.resetFields()
			}
		}
	}
}
</script>
