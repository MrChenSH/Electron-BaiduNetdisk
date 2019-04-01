import Vue from 'vue'

import App from './App'
// import store from './store'
import Util from './util'
import Axios from 'axios'
import router from './router'
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui'
import SvgIcon from 'vue2-svg-icon/Icon'
import Selectable from './util/v-selectable'
import ElBigdataTable from './components/bigdata-table'
import ImgPreview from './components/dialogs/ImgPreview'

import './styles/base.scss'
import './styles/main.less'

Vue.use(Util)
Vue.use(Selectable)
Vue.use(ElBigdataTable)
Vue.use(VueAxios, Axios)
Vue.component('svg-icon', SvgIcon)
Vue.component('img-preview', ImgPreview)
Vue.use(ElementUI, { size: 'mini' })

Vue.config.productionTip = false
Vue.axios.interceptors.request.use(
	req => {
		req.params = req.params || {}
		Object.assign(req.params, Vue.prototype.$constant.BASE, {
			logid: Vue.prototype.$util.logid(),
			bdstoken: Vue.prototype.$constant.YUN_DATA.bdstoken
		})
		return req
	},
	err => {
		console.error(err)
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
		console.error(err)
		Vue.prototype.$message({
			type: 'error',
			showClose: true,
			message: err.toString()
		})
		return Promise.reject(err)
	}
)

/* eslint-disable no-new */
new Vue({
	// store,
	router,
	template: '<App/>',
	components: { App }
}).$mount('#app')
