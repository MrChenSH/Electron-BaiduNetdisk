import Vue from 'vue'

import App from './App'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(iView)
Vue.use(VueAxios, axios)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
	components: { App },
	store,
	template: '<App/>'
}).$mount('#app')
