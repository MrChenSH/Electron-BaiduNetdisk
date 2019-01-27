import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			id: 1,
			path: '/',
			name: 'home',
			title: '我的网盘',
			component: () => import('@/components/Home')
		},
		{
			id: 2,
			path: '/transfer_list',
			name: 'transfer list',
			title: '传输列表',
			component: () => import('@/components/TransferList')
		},
		{
			id: 3,
			path: '/offline_download',
			name: 'offline download',
			title: '离线下载',
			component: () => import('@/components/OfflineDownload')
		},
		{
			id: 4,
			path: '/resource_search',
			name: 'resource search',
			title: '资源搜索',
			component: () => import('@/components/ResourceSearch')
		}
	]
})
