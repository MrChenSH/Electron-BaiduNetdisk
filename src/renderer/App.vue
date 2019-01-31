<template>
	<el-container id="app" style="height: 100%;width: 100%;position: absolute;">
		<el-header height="75px" class="nav-header">
			<el-row type="flex" align="middle" style="margin: 0;height: 75px;">
				<el-col :span="1" style="min-width: 150px;">
					<img src="~@/assets/logo.png">
				</el-col>
				<el-col></el-col>
				<el-col :span="1" class="action-group">
					<el-button-group>
						<el-button plain icon="window-icon window-minimize" @click="minimize"></el-button>
						<el-button plain v-if="!maximized" icon="window-icon window-maximize" @click="maximize"></el-button>
						<el-button plain v-else icon="window-icon window-unmaximize" @click="unmaximize"></el-button>
						<el-button plain icon="window-icon window-close" @click="close"></el-button>
					</el-button-group>
					<el-popover trigger="hover" :title="YUN_DATA.username" class="avatar-popover">
						<div slot="reference">
							<img :src="YUN_DATA.photo" class="avatar">
							<small>{{ YUN_DATA.username }}</small>
						</div>
						<div>
							<el-progress
								color="#67C23A"
								:show-text="false"
								:stroke-width="8"
								:percentage="quota.used / quota.total * 100"
							></el-progress>
							<small>{{ transferFileSize(quota.used, 3 , 0) + '/' + transferFileSize(quota.total, 3, 0) }}</small>
							<el-menu>
								<el-menu-item index="uploading">
									<i class="el-icon-upload2"></i>
									<small>正在上传(1)</small>
								</el-menu-item>
								<el-menu-item index="downloading">
									<i class="el-icon-download"></i>
									<small>正在下载(2)</small>
								</el-menu-item>
								<el-menu-item index="completed">
									<i class="el-icon-check"></i>
									<small>传输完成(3)</small>
								</el-menu-item>
							</el-menu>
						</div>
					</el-popover>
				</el-col>
			</el-row>
		</el-header>
		<el-main style="display: flex;">
			<el-tabs v-model="activeTab" class="main-tabs">
				<el-tab-pane v-for="(tab, i) in tabs" :key="i" :label="tab.label" :name="tab.name">
					<component :is="tab.component" :quota="quota" @activeTab="name => activeTab = name"/>
				</el-tab-pane>
			</el-tabs>
		</el-main>
	</el-container>
</template>

<script>
export default {
	name: 'App',
	data() {
		return {
			activeTab: 'home',
			quota: { used: 0, total: 1 },
			maximized: this.isMaximized(),
			tabs: [
				{
					name: 'home',
					label: '我的网盘',
					component: 'Home'
				},
				{
					label: '传输列表',
					name: 'transfer-list',
					component: 'TransferList'
				},
				{
					label: '离线下载',
					name: 'offline-download',
					component: 'OfflineDownload'
				},
				{
					label: '资源搜索',
					name: 'resource-search',
					component: 'ResourceSearch'
				}
			]
		}
	},
	components: {
		Home: () => import('@/components/Home'),
		TransferList: () => import('@/components/TransferList'),
		OfflineDownload: () => import('@/components/OfflineDownload'),
		ResourceSearch: () => import('@/components/ResourceSearch')
	},
	watch: {},
	created() {
		this.getQuota()
		// console.log(this)
	},
	mounted() {
		window.addEventListener('resize', () => (this.maximized = this.isMaximized()))
	},
	methods: {
		/**
		 *获取网盘配额信息
		 */
		getQuota() {
			let me = this
			me.axios
				.get(me.URL.quota, {
					params: {
						checkfree: 1,
						checkexpire: 1
					}
				})
				.then(res => (me.quota = res.data))
		}
	}
}
</script>

<style lang="less">
</style>
