<template>
	<el-container style="height: 100%;width: 100%;position: absolute;">
		<el-header height="75px" class="nav-header">
			<el-row type="flex" align="middle" style="height: 100%">
				<el-col class="logo">
					<img src="static/images/main_logo.png">
				</el-col>
				<el-col>
					<el-menu router mode="horizontal" :default-active="$route.name || 'home'">
						<el-menu-item
							:key="route.name"
							:index="route.name"
							style="-webkit-app-region: no-drag"
							v-for="route in $router.options.routes.filter(item => item.name)"
							:route="{
									path: route.name,
									query: JSON.parse(localStorage[route.name + '_query'] || '{}')
								}"
						>{{route.title}}</el-menu-item>
					</el-menu>
				</el-col>
				<el-col class="action-group">
					<el-popover
						width="228"
						trigger="hover"
						class="avatar-popover"
						:visible-arrow="false"
						placement="bottom-start"
						popper-class="avatar-popover-content"
					>
						<img slot="reference" :src="avatar" class="avatar">
						<div class="user-card">
							<div>
								<el-button type="text" class="username-btn">{{ $constant.YUN_DATA.username }}</el-button>
								<el-progress
									status="text"
									color="#67C23A"
									:stroke-width="6"
									:percentage="quota.used / quota.total * 100"
								>
									<small>{{ quota.usedText + '/' + quota.totalText }}</small>
								</el-progress>
							</div>
						</div>
						<div class="user-card">
							<el-button-group>
								<el-button>个人中心</el-button>
								<el-button>帮助中心</el-button>
								<el-button>切换账号</el-button>
								<el-button>退出</el-button>
							</el-button-group>
						</div>
					</el-popover>
					<el-button class="setting-btn" @click="$util.showMenu(menus.set,'.setting-btn')">
						<svg-icon name="setting" w="18"></svg-icon>
					</el-button>
					<el-button @click="$electron.remote.getCurrentWindow().minimize()">
						<svg-icon name="window-minimize" w="10"></svg-icon>
					</el-button>
					<el-button v-if="!maximized" @click="$electron.remote.getCurrentWindow().maximize()">
						<svg-icon name="window-maximize" w="10"></svg-icon>
					</el-button>
					<el-button v-else @click="$electron.remote.getCurrentWindow().unmaximize()">
						<svg-icon name="window-unmaximize" w="10"></svg-icon>
					</el-button>
					<el-button @click="$electron.remote.getCurrentWindow().close()" class="window-close">
						<svg-icon name="window-close" w="10"></svg-icon>
					</el-button>
				</el-col>
			</el-row>
		</el-header>
		<router-view :quota="quota"/>
	</el-container>
</template>

<script>
export default {
	name: 'App',
	data() {
		const me = this
		return {
			localStorage: localStorage,
			avatar: 'static/images/logo.ico',
			quota: {
				used: 0,
				total: 1,
				usedText: '0GB',
				totalText: '0GB'
			},
			maximized: me.$electron.remote.getCurrentWindow().isMaximized(),
			menus: {
				set: me.$electron.remote.Menu.buildFromTemplate([
					{
						label: '开始全部任务',
						icon: 'static/images/play.png'
					},
					{
						label: '暂停全部任务',
						icon: 'static/images/pause.png'
					},
					{
						label: '本次传输完成关机',
						type: 'checkbox'
					},
					{
						label: '隐藏悬浮框',
						type: 'checkbox'
					},
					{
						label: '锁定网盘',
						icon: 'static/images/lock.png'
					},
					{
						label: '设置',
						icon: 'static/images/setting.png'
					},
					{
						label: '关于'
					},
					{
						label: '检查更新'
					},
					{
						label: '问题反馈',
						icon: 'static/images/question.png',
						click: () =>
							me.$electron.shell.openExternal('https://github.com/MrChenSH/Electron-BaiduNetdisk')
					}
				]),
				tray: me.$electron.remote.Menu.buildFromTemplate([]),
				trayTemplate: [
					{ label: '百度网盘' },
					{ label: '已用：{1}GB  共：{2}GB' },
					{ type: 'separator' },
					{
						label: '打开主面板',
						icon: 'static/images/home.png',
						click: () => me.$electron.remote.getCurrentWindow().show()
					},
					{ label: '访问百度网盘网站' },
					{ label: '进入回收站' },
					{ type: 'separator' },
					{ label: '开始全部任务', icon: 'static/images/play.png' },
					{ label: '暂停全部任务', icon: 'static/images/pause.png' },
					{ label: '本次传输完成关机', type: 'checkbox' },
					{ type: 'separator' },
					{ label: '隐藏悬浮框', type: 'checkbox' },
					{ type: 'separator' },
					{ label: '设置', icon: 'static/images/setting.png' },
					{
						label: '帮助',
						icon: 'static/images/question.png',
						submenu: [
							{ label: '使用帮助' },
							{ label: '关于' },
							{ label: '检查更新' },
							{ label: '问题反馈' }
						]
					},
					{ type: 'separator' },
					{ label: '锁定网盘', icon: 'static/images/lock.png' },
					{ label: '切换账号', icon: 'static/images/switch.png' },
					{ label: '退出', icon: 'static/images/quit.png' }
				]
			}
		}
	},
	mounted() {
		const me = this

		console.log('App', me)

		me.$util
			.visitHome()
			.then(data => {
				me.getQuota()
				me.avatar = data.photo
				me.menus.trayTemplate[0].label = data.username
			})
			.catch(err => {
				console.log(err)
				me.$message({
					type: 'error',
					showClose: true,
					message: err.toString()
				})
			})

		window.addEventListener(
			'resize',
			() => (this.maximized = this.$electron.remote.getCurrentWindow().isMaximized())
		)
	},
	watch: {
		quota: {
			deep: true,
			handler(quota) {
				const me = this
				me.menus.trayTemplate[1].label = `已用：${quota.usedText}  共：${quota.totalText}`
				me.menus.tray = me.$electron.remote.Menu.buildFromTemplate(me.menus.trayTemplate)
				me.$electron.remote.app.tray.setContextMenu(me.menus.tray)
			}
		}
	},
	methods: {
		/**
		 *获取网盘配额信息
		 */
		getQuota() {
			const me = this

			me.axios
				.get(me.$constant.API.quota, {
					params: {
						checkfree: 1,
						checkexpire: 1
					}
				})
				.then(res => {
					me.quota = {
						used: res.data.used,
						total: res.data.total,
						usedText: me.$util.transferFileSize(res.data.used, 3, 0),
						totalText: me.$util.transferFileSize(res.data.total, 3, 0)
					}
				})
		},
		/**
		 * 跳转到个人设置
		 */
		onClickToUserSetting() {
			this.$electron.remote.session.defaultSession.cookies.get(
				{ name: 'BDUSS', domain: '.baidu.com' },
				(error, cookies) => {
					console.log(cookies)
				}
			)
		}
	}
}
</script>
