import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '*',
			redirect: '/home'
		},
		{
			title: '我的网盘',
			name: 'home',
			path: '/home',
			component: () => import('@/view/Home')
			/*components: {
				main: () => import('@/view/Home'),
				menu: () => import('@/components/menu/Category')
			}*/
		},
		{
			title: '传输列表',
			name: 'transfer-list',
			path: '/transfer-list',
			component: () => import('@/view/TransferList')
			/*components: {
				main: () => import('@/view/TransferList'),
				menu: () => import('@/components/menu/Transfer')
			}*/
		},
		{
			title: '离线下载',
			name: 'offline-download',
			path: '/offline-download',
			component: () => import('@/view/OfflineDownload')
			/*components: {
				main: () => import('@/view/OfflineDownload')
			}*/
		},
		{
			title: '资源搜索',
			name: 'resource-search',
			path: '/resource-search',
			component: () => import('@/view/ResourceSearch')
			/*components: {
				main: () => import('@/view/ResourceSearch')
			}*/
		}
	]
})
