import Vue from 'vue'

import App from './App'
// import store from './store'
import util from './util/util'
import selectable from './util/v-selectable'
import constant from './store/constant'
import axios from 'axios'
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui'
import contentmenu from 'v-contextmenu'
// import ElBigdataTable from 'vue-element-bigdata-table'
import 'v-contextmenu/dist/index.css'
import './styles/base.scss'
import './styles/main.less'
import './styles/index.css'

Object.assign(Vue.prototype, util, constant)
Vue.config.productionTip = false
Vue.use(selectable)
Vue.use(contentmenu)
Vue.use(VueAxios, axios)
Vue.use(ElementUI, {
	size: 'mini'
})

Vue.axios.interceptors.request.use(
	req => {
		req.params = req.params || {}
		Object.assign(req.params, constant.BASE, {
			logid: util.logid(),
			bdstoken: constant.YUN_DATA.bdstoken
		})
		return req
	},
	err => {
		Vue.prototype.$message({
			type: 'error',
			showClose: true,
			message: err.toString()
		})
		return Promise.reject(err)
	}
)

Vue.axios.interceptors.response.use(
	res => {
		let responseType = res.request.responseType || 'json'
		if (responseType.toLowerCase() === 'json' && res.data && res.data.errno !== 0) {
			Vue.prototype.$message({
				type: 'error',
				showClose: true,
				message: '系统异常'
			})
			return Promise.reject(res.data)
		}
		return res
	},
	err => {
		console.log(err)
		Vue.prototype.$message({
			type: 'error',
			showClose: true,
			message: err.toString()
		})
		return Promise.reject(err)
	}
)

/* eslint-disable no-new */
util.visitHome()
	.then(() => {
		new Vue({
			// store,
			template: '<App/>',
			components: { App }
		}).$mount('#app')
	})
	.catch(err => {
		console.log(err)
		Vue.prototype.$message({
			type: 'error',
			showClose: true,
			message: err.toString()
		})
	})
