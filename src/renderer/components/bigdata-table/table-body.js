import { getCell, getColumnByCell, getRowIdentity } from './util'
import { hasClass, addClass, removeClass } from 'element-ui/src/utils/dom'
// import ElCheckbox from 'element-ui/packages/checkbox';
import debounce from 'throttle-debounce/debounce'
import LayoutObserver from './layout-observer'

export default {
	name: 'ElTableBody',

	mixins: [LayoutObserver],

	// components: {
	//   ElCheckbox
	// },

	props: {
		store: {
			required: true
		},
		stripe: Boolean,
		context: {},
		rowClassName: [String, Function],
		rowStyle: [Object, Function],
		fixed: String,
		highlight: Boolean,
		//
		tableData: Array,
		times0: Number,
		times1: Number,
		times2: Number,
		groupIndex: Number,
		itemNum: Number,
		tableIndex: Number,
		itemRowHeight: {
			type: Number,
			default: 28
		}
	},

	render(h) {
		const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index))
		return (
			<table ref="tableBody" class="el-table__body" cellspacing="0" cellpadding="0" border="0">
				<colgroup>
					{this._l(this.columns, column => (
						<col name={column.id} />
					))}
				</colgroup>
				<tbody>
					{this._l(this.timesTableData, (row, $index) => [
						<tr
							data-row-index={this.fvIndex($index, row)}
							style={this.rowStyle ? this.getRowStyle(row, this.fvIndex($index, row)) : null}
							key={
								this.table.rowKey
									? this.getKeyOfRow(row, this.fvIndex($index, row))
									: this.fvIndex($index, row)
							}
							on-dblclick={$event => this.handleDoubleClick($event, row)}
							on-click={$event => this.handleClick($event, row)}
							on-contextmenu={$event => this.handleContextMenu($event, row)}
							on-mouseenter={() => this.handleMouseEnter(this.fvIndex($index, row))}
							on-mouseleave={() => this.handleMouseLeave()}
							class={[this.getRowClass(row, this.fvIndex($index, row))]}
						>
							{this._l(this.columns, (column, cellIndex) => {
								const { rowspan, colspan } = this.getSpan(
									row,
									column,
									this.fvIndex($index, row),
									cellIndex
								)
								if (!rowspan || !colspan) {
									return ''
								} else {
									if (rowspan === 1 && colspan === 1) {
										return (
											<td
												style={[
													{ height: this.itemRowHeight + 'px' },
													this.getCellStyle(this.fvIndex($index, row), cellIndex, row, column)
												]}
												class={this.getCellClass(
													this.fvIndex($index, row),
													cellIndex,
													row,
													column
												)}
												on-mouseenter={$event => this.handleCellMouseEnter($event, row)}
												on-mouseleave={this.handleCellMouseLeave}
											>
												{column.renderCell.call(
													this._renderProxy,
													h,
													{
														row,
														column,
														$index: this.fvIndex($index, row),
														store: this.store,
														_self: this.context || this.table.$vnode.context
													},
													columnsHidden[cellIndex]
												)}
											</td>
										)
									} else {
										return (
											<td
												style={[
													{ height: this.itemRowHeight + 'px' },
													this.getCellStyle(this.fvIndex($index, row), cellIndex, row, column)
												]}
												class={this.getCellClass(
													this.fvIndex($index, row),
													cellIndex,
													row,
													column
												)}
												rowspan={rowspan}
												colspan={colspan}
												on-mouseenter={$event => this.handleCellMouseEnter($event, row)}
												on-mouseleave={this.handleCellMouseLeave}
											>
												{column.renderCell.call(
													this._renderProxy,
													h,
													{
														row,
														column,
														$index: this.fvIndex($index, row),
														store: this.store,
														_self: this.context || this.table.$vnode.context
													},
													columnsHidden[cellIndex]
												)}
											</td>
										)
									}
								}
							})}
						</tr>,
						this.store.isRowExpanded(row) ? (
							<tr>
								<td colspan={this.columns.length} class="el-table__expanded-cell">
									{this.table.renderExpanded
										? this.table.renderExpanded(h, {
												row,
												$index: this.fvIndex($index, row),
												store: this.store
										  })
										: ''}
								</td>
							</tr>
						) : (
							''
						)
					]).concat(
						<el-tooltip
							effect={this.table.tooltipEffect}
							placement="top"
							ref="tooltip"
							content={this.tooltipContent}
						/>
					)}
				</tbody>
			</table>
		)
	},

	watch: {
		'store.states.hoverRow'(newVal, oldVal) {
			if (!this.store.states.isComplex) return
			const el = this.$el
			if (!el) return
			const data = this.data
			const currentData = this.timesTableData
			const tr = el.querySelector('tbody').children
			const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'))
			const oldRow = rows[currentData.indexOf(data[oldVal])]
			const newRow = rows[currentData.indexOf(data[newVal])]
			if (oldRow) {
				removeClass(oldRow, 'hover-row')
			}
			if (newRow) {
				addClass(newRow, 'hover-row')
			}
		},
		'store.states.currentRow'(newVal, oldVal) {
			if (!this.highlight) return
			const el = this.$el
			if (!el) return
			const data = this.timesTableData
			const tr = el.querySelector('tbody').children
			const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'))
			const oldRow = rows[data.indexOf(oldVal)]
			const newRow = rows[data.indexOf(newVal)]
			if (oldRow) {
				removeClass(oldRow, 'current-row')
			} else {
				;[].forEach.call(rows, row => removeClass(row, 'current-row'))
			}
			if (newRow) {
				addClass(newRow, 'current-row')
			}
		}
	},

	computed: {
		table() {
			return this.$parent
		},

		data() {
			return this.store.states.data
		},

		columnsCount() {
			return this.store.states.columns.length
		},

		leftFixedLeafCount() {
			return this.store.states.fixedLeafColumnsLength
		},

		rightFixedLeafCount() {
			return this.store.states.rightFixedLeafColumnsLength
		},

		leftFixedCount() {
			return this.store.states.fixedColumns.length
		},

		rightFixedCount() {
			return this.store.states.rightFixedColumns.length
		},

		columns() {
			return this.store.states.columns
		},
		//  取数据
		timesTableData() {
			let data = []
			let count1 = 0
			let count2 = 0
			let count3 = 0
			this.data.filter((e, i) => {
				e.initRowIndex = i
			})
			switch (this.tableIndex) {
				case 1:
					count1 = this.times0 * this.itemNum * 3
					data = this.data.slice(count1, count1 + this.itemNum)
					break
				case 2:
					count2 = this.times1 * this.itemNum * 3
					data = this.data.slice(count2 + this.itemNum, count2 + this.itemNum * 2)
					break
				case 3:
					count3 = this.times2 * this.itemNum * 3
					data = this.data.slice(count3 + this.itemNum * 2, count3 + this.itemNum * 3)
					break
			}
			//  选中行
			this.$nextTick(() => {
				this.dfCurrentRow(this.store.states.currentRow)
			})

			return data
		}
	},

	data() {
		return {
			tooltipContent: '',
			//  定时器监听table高度改变
			intervalId: null,
			//  当前table高度
			tableBodyHeight: 0
		}
	},

	created() {
		this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper())
	},
	mounted() {
		this.$nextTick(() => {
			this.tableBodyHeight = this.$refs.tableBody.offsetHeight
			//  定时器监听当前表格高度改变
			this.intervalId = setInterval(() => {
				if (
					this.$refs.tableBody.offsetHeight > 0 &&
					this.tableBodyHeight !== this.$refs.tableBody.offsetHeight
				) {
					//  有改变
					this.tableBodyHeight = this.$refs.tableBody.offsetHeight
					//  当前块取当前分组
					let groupIndex = this.times0
					switch (this.tableIndex) {
						case 1:
							groupIndex = this.times0 * 3 + this.tableIndex - 1
							break
						case 2:
							groupIndex = this.times1 * 3 + this.tableIndex - 1
							break
						case 3:
							groupIndex = this.times2 * 3 + this.tableIndex - 1
							break
					}
					// 执行修改高度与总高度
					this.$emit('changeHeight', groupIndex, this.tableBodyHeight)
				}
			}, 80)
		})
	},
	destroyed() {
		if (this.intervalId) {
			clearInterval(this.intervalId)
		}
	},
	methods: {
		// _l (data, cb) {
		//   for (let i in data) {
		//     cb(data[i], i);
		//   }
		// },
		getKeyOfRow(row, index) {
			const rowKey = this.table.rowKey
			if (rowKey) {
				return getRowIdentity(row, rowKey)
			}
			return index
		},

		isColumnHidden(index) {
			if (this.fixed === true || this.fixed === 'left') {
				return index >= this.leftFixedLeafCount
			} else if (this.fixed === 'right') {
				return index < this.columnsCount - this.rightFixedLeafCount
			} else {
				return index < this.leftFixedLeafCount || index >= this.columnsCount - this.rightFixedLeafCount
			}
		},

		getSpan(row, column, rowIndex, columnIndex) {
			let rowspan = 1
			let colspan = 1

			const fn = this.table.spanMethod
			if (typeof fn === 'function') {
				const result = fn({
					row,
					column,
					rowIndex,
					columnIndex
				})

				if (Array.isArray(result)) {
					rowspan = result[0]
					colspan = result[1]
				} else if (typeof result === 'object') {
					rowspan = result.rowspan
					colspan = result.colspan
				}
			}

			return {
				rowspan,
				colspan
			}
		},

		getRowStyle(row, rowIndex) {
			const rowStyle = this.table.rowStyle
			if (typeof rowStyle === 'function') {
				return rowStyle.call(this, {
					row,
					rowIndex
				})
			}
			return rowStyle
		},

		getRowClass(row, rowIndex) {
			const classes = ['el-table__row']

			if (this.stripe && rowIndex % 2 === 1) {
				classes.push('el-table__row--striped')
			}
			const rowClassName = this.table.rowClassName
			if (typeof rowClassName === 'string') {
				classes.push(rowClassName)
			} else if (typeof rowClassName === 'function') {
				classes.push(
					rowClassName.call(this, {
						row,
						rowIndex
					})
				)
			}

			if (this.store.states.expandRows.indexOf(row) > -1) {
				classes.push('expanded')
			}

			return classes.join(' ')
		},

		getCellStyle(rowIndex, columnIndex, row, column) {
			const cellStyle = this.table.cellStyle
			if (typeof cellStyle === 'function') {
				return cellStyle.call(this, {
					rowIndex,
					columnIndex,
					row,
					column
				})
			}
			return cellStyle
		},

		getCellClass(rowIndex, columnIndex, row, column) {
			const classes = [column.id, column.align, column.className]

			if (this.isColumnHidden(columnIndex)) {
				classes.push('is-hidden')
			}

			const cellClassName = this.table.cellClassName
			if (typeof cellClassName === 'string') {
				classes.push(cellClassName)
			} else if (typeof cellClassName === 'function') {
				classes.push(
					cellClassName.call(this, {
						rowIndex,
						columnIndex,
						row,
						column
					})
				)
			}

			return classes.join(' ')
		},

		handleCellMouseEnter(event, row) {
			const table = this.table
			const cell = getCell(event)

			if (cell) {
				const column = getColumnByCell(table, cell)
				const hoverState = (table.hoverState = { cell, column, row })
				table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event)
			}

			// 判断是否text-overflow, 如果是就显示tooltip
			const cellChild = event.target.querySelector('.cell')

			if (
				hasClass(cellChild, 'el-tooltip') &&
				cellChild.scrollWidth > cellChild.offsetWidth &&
				this.$refs.tooltip
			) {
				const tooltip = this.$refs.tooltip
				// TODO 会引起整个 Table 的重新渲染，需要优化
				this.tooltipContent = cell.textContent || cell.innerText
				tooltip.referenceElm = cell
				tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
				tooltip.doDestroy()
				tooltip.setExpectedState(true)
				this.activateTooltip(tooltip)
			}
		},

		handleCellMouseLeave(event) {
			const tooltip = this.$refs.tooltip
			if (tooltip) {
				tooltip.setExpectedState(false)
				tooltip.handleClosePopper()
			}
			const cell = getCell(event)
			if (!cell) return

			const oldHoverState = this.table.hoverState || {}
			this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event)
		},

		handleMouseEnter(index) {
			this.store.commit('setHoverRow', index)
		},

		handleMouseLeave() {
			this.store.commit('setHoverRow', null)
		},

		handleContextMenu(event, row) {
			this.handleEvent(event, row, 'contextmenu')
		},

		handleDoubleClick(event, row) {
			this.handleEvent(event, row, 'dblclick')
		},

		handleClick(event, row) {
			this.store.commit('setCurrentRow', row)
			this.handleEvent(event, row, 'click')
		},

		handleEvent(event, row, name) {
			const table = this.table
			const cell = getCell(event)
			let column
			if (cell) {
				column = getColumnByCell(table, cell)
				if (column) {
					table.$emit(`cell-${name}`, row, column, cell, event)
				}
			}
			table.$emit(`row-${name}`, row, event, column)
		},

		handleExpandClick(row, e) {
			e.stopPropagation()
			this.store.toggleRowExpansion(row)
		},
		//  $index 处理
		fvIndex(index, item) {
			let _index = index
			if (item && 'initRowIndex' in item) {
				_index = item['initRowIndex']
			}
			return _index
		},
		//  默认选中行处理
		dfCurrentRow(currentRow) {
			if (!this.highlight) return
			const el = this.$el
			if (!el) return
			// const data = this.store.states.data;
			const data = this.timesTableData
			const tr = el.querySelector('tbody').children
			const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'))
			const oldRow = rows[data.indexOf(currentRow)]
			const newRow = rows[data.indexOf(currentRow)]
			if (oldRow) {
				removeClass(oldRow, 'current-row')
			} else {
				;[].forEach.call(rows, row => removeClass(row, 'current-row'))
			}
			if (newRow) {
				addClass(newRow, 'current-row')
			}
		}
	}
}
