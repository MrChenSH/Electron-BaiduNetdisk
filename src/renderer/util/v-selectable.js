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

	const getSelections = children => {
		let selections = []
		children.forEach((child, i) => {
			if (child.hasAttribute('selected')) {
				selections.push({
					node: child,
					index: i
				})
			}
		})
		return selections
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
			isMouseMove = false,
			isMouseDown = false,
			selector = (binding.value || {}).selector,
			areaSelect = document.createElement('div'),
			selectedClass = (binding.value || {}).selectedClass || 'selected'

		Object.assign(areaSelect.style, {
			zIndex: 99999,
			position: 'absolute',
			pointerEvents: 'none',
			border: '1px solid #06a8ff',
			backgroundColor: 'rgba(50, 128, 252, 0.2)'
		})

		ele.addEventListener('mousedown', e => {
			if (e.button !== 0) return

			startX = e.pageX
			startY = e.pageY
			isMouseMove = false
			areaSelect.style.display = 'none'
			children = selector ? Array.from(ele.querySelectorAll(selector)) : Array.from(ele.children)
			isMouseDown = !children.find(child => child.contains(e.target))

			if (isMouseDown) {
				document.head.append(style)
				document.body.appendChild(areaSelect)
				ele.classList.add('text-select-none')
			}

			let changes = []

			children.forEach((child, i) => {
				if (child.hasAttribute('selected')) {
					child.removeAttribute('selected')
					child.classList.remove(selectedClass)
					changes.push({
						index: i,
						node: child,
						selected: false
					})
				}
			})

			vnode.componentInstance.$emit('select-change', getSelections(children), changes)
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
				vnode.componentInstance.$emit('select-end', getSelections(children))
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
					isMouseMove = true
					Object.assign(areaSelect.style, {
						display: 'block',
						top: range.top + 'px',
						left: range.left + 'px',
						width: range.width + 'px',
						height: range.height + 'px'
					})

					let changes = []

					children.forEach((child, i) => {
						let win = child.ownerDocument.defaultView,
							offset = child.getBoundingClientRect().toJSON()

						Object.assign(offset, {
							top: offset.top + win.pageYOffset,
							left: offset.left + win.pageXOffset
						})

						if (isIntersectArea(range, offset)) {
							if (!child.hasAttribute('selected')) {
								child.classList.add(selectedClass)
								child.setAttribute('selected', 'selected')
								changes.push({
									index: i,
									node: child,
									selected: true
								})
							}
						} else {
							if (child.hasAttribute('selected')) {
								child.removeAttribute('selected')
								child.classList.remove(selectedClass)
								changes.push({
									index: i,
									node: child,
									selected: false
								})
							}
						}
					})

					vnode.componentInstance.$emit('select-change', getSelections(children), changes)
				}
			}
		})
	}

	Vue.directive('selectable', {
		inserted: listener,
		updated: listener
	})
}
