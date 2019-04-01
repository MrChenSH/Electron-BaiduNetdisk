import axios from 'axios'
import constant from '../store/constant'
import { remote } from 'electron'
const units = [' B', ' KB', ' MB', ' GB', ' TB', ' EB']

export default {
	test() {
		console.log(this, Array.from(arguments))
	},
	showMenu(menu, selector) {
		if (event) event.stopPropagation()
		let pos = {}
		if (selector) {
			let rect = document.querySelector(selector).getBoundingClientRect()
			pos = {
				x: Math.round(rect.x),
				y: Math.round(rect.y + rect.height)
			}
		}
		menu.popup(pos)
	},
	visitHome() {
		return new Promise((resolve, reject) => {
			axios
				.get(constant.API.home, {
					responseType: 'document'
				})
				.then(res => {
					let match = res.data.body.innerText.match(/var context=(.*);/)
					resolve(Object.assign(constant.YUN_DATA, JSON.parse(match[1])))
				})
				.catch(err => reject(err))
		})
	},
	confirm(title, detail, message) {
		return new Promise(resolve => {
			remote.dialog.showMessageBox(
				remote.getCurrentWindow(),
				{
					title: title,
					detail: detail,
					type: 'warning',
					message: message,
					buttons: ['Ok', 'Cancel'],
					icon: 'static/images/question_32.png'
				},
				rs => resolve(rs === 0)
			)
		})
	},
	/**
	 *根据文件名获取文件图标
	 *
	 * @param {Object} file 网盘文件信息
	 * @param {String} size 图标大小(Big,Middle,Small)
	 */
	getFileIcon(file, size) {
		let src = constant.ICONS.default.src

		if (Array.isArray(file.fsIds) && file.fsIds.length > 1) src = constant.ICONS.mix.src
		else if (file.isdir) {
			if (file.path.startsWith('/apps')) src = constant.ICONS.apps.src
			else src = constant.ICONS.dir.src
		} else {
			for (let key in constant.ICONS) {
				let item = constant.ICONS[key]
				if (item.regex && item.regex.test(file.server_filename.toLowerCase())) {
					src = item.src
					break
				}
			}
		}

		return src.replace('Middle', size || 'Middle')
	},
	/**
	 * 将字节单位进行转换
	 *
	 * @param {Number} size 文件大小，单位字节
	 * @param {Number} digit 单位数位{0-5}
	 * @param {Number} fixed 精确多少位
	 */
	transferFileSize(size, digit, fixed) {
		if (!size || isNaN(size)) return '0 B'
		digit = digit || Number.parseInt(Math.log10(size) / Math.log10(1024))
		return (
			(size / Math.pow(1024, digit)).toLocaleString('arab', { maximumFractionDigits: isNaN(fixed) ? 2 : fixed }) +
			units[digit]
		)
	},
	/**
	 * 生成签名
	 *
	 * @param {String} sign3
	 * @param {String} sign1
	 */
	sign(sign3, sign1) {
		let a = []
		let p = []
		let o = ''
		let v = sign3.length
		for (let q = 0; q < 256; q++) {
			a[q] = sign3.substr(q % v, 1).charCodeAt(0)
			p[q] = q
		}
		for (let u = 0, q = 0; q < 256; q++) {
			u = (u + p[q] + a[q]) % 256
			let t = p[q]
			p[q] = p[u]
			p[u] = t
		}
		for (let i = 0, u = 0, q = 0; q < sign1.length; q++) {
			i = (i + 1) % 256
			u = (u + p[i]) % 256
			let t = p[i]
			p[i] = p[u]
			p[u] = t
			let k = p[(p[i] + p[u]) % 256]
			o += String.fromCharCode(sign1.charCodeAt(q) ^ k)
		}
		return this.base64Encode(o)
	},
	/**
	 * 生成每次请求logid
	 */
	logid() {
		let u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&'
		let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
		let f = String.fromCharCode
		function l(e) {
			if (e.length < 2) {
				let n = e.charCodeAt(0)
				return 128 > n
					? e
					: 2048 > n
					? f(192 | (n >>> 6)) + f(128 | (63 & n))
					: f(224 | ((n >>> 12) & 15)) + f(128 | ((n >>> 6) & 63)) + f(128 | (63 & n))
			}
			let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320)
			return (
				f(240 | ((n >>> 18) & 7)) + f(128 | ((n >>> 12) & 63)) + f(128 | ((n >>> 6) & 63)) + f(128 | (63 & n))
			)
		}
		function g(e) {
			return (e + '' + Math.random()).replace(d, l)
		}
		function m(e) {
			let n = [0, 2, 1][e.length % 3]
			let t =
				(e.charCodeAt(0) << 16) |
				((e.length > 1 ? e.charCodeAt(1) : 0) << 8) |
				(e.length > 2 ? e.charCodeAt(2) : 0)
			let o = [
				u.charAt(t >>> 18),
				u.charAt((t >>> 12) & 63),
				n >= 2 ? '=' : u.charAt((t >>> 6) & 63),
				n >= 1 ? '=' : u.charAt(63 & t)
			]
			return o.join('')
		}
		function h(e) {
			return e.replace(/[\s\S]{1,3}/g, m)
		}
		function p() {
			return h(g(new Date().getTime()))
		}
		function w(e, n) {
			return n
				? p(String(e))
						.replace(/[+\/]/g, function(e) {
							return '+' == e ? '-' : '_'
						})
						.replace(/=/g, '')
				: p(String(e))
		}
		return w()
	},
	base64Encode(str) {
		let a,
			r,
			e,
			n,
			i,
			s,
			o = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
		for (e = str.length, r = 0, a = ''; e > r; ) {
			if (((n = 255 & str.charCodeAt(r++)), r == e)) {
				a += o.charAt(n >> 2)
				a += o.charAt((3 & n) << 4)
				a += '=='
				break
			}
			if (((i = str.charCodeAt(r++)), r == e)) {
				a += o.charAt(n >> 2)
				a += o.charAt(((3 & n) << 4) | ((240 & i) >> 4))
				a += o.charAt((15 & i) << 2)
				a += '='
				break
			}
			s = str.charCodeAt(r++)
			a += o.charAt(n >> 2)
			a += o.charAt(((3 & n) << 4) | ((240 & i) >> 4))
			a += o.charAt(((15 & i) << 2) | ((192 & s) >> 6))
			a += o.charAt(63 & s)
		}
		return a
	}
}

Object.isEmpty = obj => {
	for (const key in obj) return false
	return true
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String(默认格式yyyy-MM-dd) <br>
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符<br>
 * 年(y)可以用 1-4 个占位符，时间段(a)只能用一个占位符(表示上下午)，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)<br>
 * eg:<br>
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423<br>
 * (new Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * <br>
 * (new Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04<br>
 * (new Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04<br>
 * (new Date()).format("yyyy-M-d a h:m:s.S") ==> 2006-7-2 上午 8:9:4.18<br>
 */
Date.prototype.format = function(pattern) {
	pattern = pattern || 'yyyy-MM-dd'

	let o = {
		'M+': this.getMonth() + 1, // 月份
		'd+': this.getDate(), // 日
		'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
		'H+': this.getHours(), // 小时
		'm+': this.getMinutes(), // 分
		's+': this.getSeconds(), // 秒
		'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
		a: this.getHours() < 12 ? '\u4E0A\u5348' : '\u4E0B\u5348', // 上午
		// 下午
		S: this.getMilliseconds() // 毫秒
	}

	let week = ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d']

	if (/(y+)/.test(pattern)) {
		pattern = pattern.replace(
			RegExp.$1,
			this.getFullYear()
				.toString()
				.substr(4 - RegExp.$1.length)
		)
	}
	if (/(E+)/.test(pattern)) {
		pattern = pattern.replace(
			RegExp.$1,
			(RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[this.getDay()]
		)
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(pattern)) {
			pattern = pattern.replace(
				RegExp.$1,
				RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
			)
		}
	}
	return pattern
}

/**
 * 字符串预处理格式化
 */
String.prototype.format = function(args) {
	let result = this
	if (arguments.length > 0) {
		let reg
		if (arguments.length === 1 && typeof args === 'object') {
			for (const key in args) {
				if (args[key] !== undefined) {
					reg = new RegExp('({' + key + '})', 'g')
					result = result.replace(reg, args[key])
				}
			}
		} else {
			for (let i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined) {
					reg = new RegExp('({[' + (i + 1) + ']})', 'g')
					result = result.replace(reg, arguments[i])
				}
			}
		}
	}
	return result.replace(/({[\d]})/g, '')
}
