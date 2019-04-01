export default (Vue, options = {}) => {
	const isPointInner = (x, y, a) => {
		return x >= a.left && x <= a.left + a.width && y >= a.top && y <= a.top + a.height
	}

	const isIntersectArea = (a, b) => {
		let x1 = Math.max(a.left, b.left),
			y1 = Math.max(a.top, b.top),
			x2 = Math.min(a.left + a.width, b.left + b.width),
			y2 = Math.min(a.top + a.height, b.top + b.height)

		return isPointInner(x1, y1, a) && isPointInner(x2, y2, a) && isPointInner(x1, y1, b) && isPointInner(x2, y2, b)
	}

	const style = document.createElement('style')

	style.type = 'text/css'
	style.textContent = `
		.text-select-none {
			user-select: none;
		}
	`
	const listener = (ele, binding, vnode) => {
		let startX = 0,
			startY = 0,
			children = [],
			selections = [],
			deselections = [],
			isMouseMove = false,
			isMouseDown = false,
			selector = (binding.value || {}).selector,
			areaSelect = document.createElement('div')

		Object.assign(areaSelect.style, {
			position: 'absolute',
			pointerEvents: 'none',
			border: '1px solid #06a8ff',
			zIndex: Number.MAX_SAFE_INTEGER,
			backgroundColor: 'rgba(50, 128, 252, 0.2)'
		})

		ele.addEventListener('mousedown', e => {
			if (e.button !== 0) return

			startX = e.pageX
			startY = e.pageY
			deselections = []
			isMouseMove = false
			areaSelect.style.display = 'none'
			children = selector ? Array.from(ele.querySelectorAll(selector)) : Array.from(ele.children)
			isMouseDown = !children.find(child => child.contains(e.target))

			if (isMouseDown) {
				document.head.append(style)
				document.body.appendChild(areaSelect)
				ele.classList.add('text-select-none')
			}

			children.forEach(child => {
				if (child.selected) {
					delete child.selected
					deselections.push(child)
				}
			})
		})

		ele.addEventListener('mouseup', e => {
			if (isMouseDown) {
				isMouseDown = false
				document.head.removeChild(style)
				document.body.removeChild(areaSelect)
				ele.classList.remove('text-select-none')
			}
			if (isMouseMove) {
				isMouseMove = false
				vnode.componentInstance.$emit('select-end', selections)
			}
		})

		ele.addEventListener('mousemove', e => {
			if (isMouseDown) {
				let range = {
					top: Math.min(e.pageY, startY),
					left: Math.min(e.pageX, startX),
					width: Math.abs(e.pageX - startX),
					height: Math.abs(e.pageY - startY)
				}

				if (range.width && range.width) {
					selections = []
					isMouseMove = true
					Object.assign(areaSelect.style, {
						display: 'block',
						top: range.top + 'px',
						left: range.left + 'px',
						width: range.width + 'px',
						height: range.height + 'px'
					})

					let changes = Array.from(deselections)

					deselections = []

					children.forEach(child => {
						let win = child.ownerDocument.defaultView,
							offset = child.getBoundingClientRect().toJSON()

						Object.assign(offset, {
							top: offset.top + win.pageYOffset,
							left: offset.left + win.pageXOffset
						})

						if (isIntersectArea(range, offset)) {
							if (!child.selected) {
								changes.push(child)
								child.selected = true
							}
							selections.push(child)
						} else {
							if (child.selected) {
								changes.push(child)
								delete child.selected
							}
						}
					})

					if (changes.length) vnode.componentInstance.$emit('select-change', selections, changes)
				}
			}
		})
	}

	Vue.directive('selectable', {
		inserted: listener,
		updated: listener
	})
}
