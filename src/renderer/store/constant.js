const URL = {
	home: 'https://pan.baidu.com/disk/home', // 网盘首页
	list: 'https://pan.baidu.com/api/list', // 获取文件列表
	quota: 'https://pan.baidu.com/api/quota', // 获取网盘配额信息
	search: 'https://pan.baidu.com/api/search', // 搜索
	share: 'https://pan.baidu.com/share/record', // 我的分享,
	userinfo: 'http://pan.baidu.com/api/user/getinfo', // 个人信息
	recycle: 'https://pan.baidu.com/api/recycle/list', // 回收站
	categorylist: 'https://pan.baidu.com/api/categorylist', // 获取分类列表
	upload: 'https://nj02ct01.pcs.baidu.com/rest/2.0/pcs/superfile2' // 上传文件URL
}

const BASE = {
	web: 1,
	appid: 250528,
	clienttype: 0,
	t: Math.random(),
	channel: 'chunlei'
}
const ROOT = {
	path: '/',
	text: '我的网盘'
}
const ICONS = {
	dir: {
		iconClass: 'dir-small',
		largeIconClass: 'dir-large'
	},
	apps: {
		iconClass: 'dir-apps-small',
		largeIconClass: 'dir-apps-large'
	},
	default: {
		iconClass: 'default-small'
	},
	image: {
		regex: /\.(gif|jpg|jpeg|png|bmp)$/,
		iconClass: 'fileicon-small-pic'
	},
	video: {
		regex: /\.(avi|wmv|mpeg|mp4|mov|mkv|flv|f4v|m4v|rmvb|rm|3gp|vob)$/,
		iconClass: 'fileicon-small-video'
	},
	audio: {
		regex: /\.(mp3|wav|m4a|ape|flac|ape|ogg)$/,
		iconClass: 'fileicon-small-mp3'
	},
	archive: {
		regex: /\.(zip|rar|7z|cab|tgz|tar.gz|tar.xz|lz|deb)$/,
		iconClass: 'fileicon-small-zip'
	},
	code: {
		regex: /\.(java|js|c|ts|json)$/,
		iconClass: 'fileicon-sys-s-code'
	},
	font: {
		regex: /\.(font|ttf)$/,
		iconClass: 'fileicon-sys-s-fonts'
	},
	doc: {
		regex: /\.(doc|docx)$/,
		iconClass: 'fileicon-small-doc'
	},
	xls: {
		regex: /\.(xls|xlsx)$/,
		iconClass: 'fileicon-small-xls'
	},
	ppt: {
		regex: /\.(ppt|pptx)$/,
		iconClass: 'fileicon-small-ppt'
	},
	text: {
		regex: /\.(txt|log|ini|properties)$/,
		iconClass: 'fileicon-small-txt'
	},
	apk: {
		regex: /\.(apk)$/,
		iconClass: 'fileicon-sys-s-apk'
	},
	pdf: {
		regex: /\.(pdf)$/,
		iconClass: 'fileicon-small-pdf'
	},
	exe: {
		regex: /\.(exe)$/,
		iconClass: 'fileicon-sys-s-exe'
	},
	torrent: {
		regex: /\.(torrent)$/,
		iconClass: 'fileicon-small-bt'
	}
}

const REGXS = {
	fileName: /^[^\\\\/:*?\"<>|]+$/
}

// category文件分类 1视频，2音乐，3图片，4文档。。。

const MENUS = [
	{
		text: '最近使用',
		icon: 'el-icon-time'
	},
	{
		url: URL.list,
		text: '全部文件',
		icon: 'el-icon-tickets'
	},
	{
		category: 3,
		text: '图片',
		url: URL.categorylist,
		icon: 'el-icon-picture-outline'
	},
	{
		category: 1,
		text: '视频',
		url: URL.categorylist,
		icon: 'el-icon-video'
	},
	{
		category: 4,
		text: '文档',
		url: URL.categorylist,
		icon: 'el-icon-document'
	},
	{
		category: 2,
		text: '音乐',
		url: URL.categorylist,
		icon: 'el-icon-service'
	},
	{
		category: 7,
		text: '种子',
		url: URL.categorylist,
		icon: 'el-icon-torrent'
	},
	{
		category: 6,
		text: '其它',
		url: URL.categorylist,
		icon: 'el-icon-star-off'
	},
	{
		text: '隐藏空间',
		icon: 'el-icon-view'
	},
	{
		text: '我的分享',
		url: URL.share,
		icon: 'el-icon-share'
	},
	{
		text: '回收站',
		url: URL.recycle,
		icon: 'el-icon-delete'
	}
]

const SORT = {
	props: {
		size: 'size',
		time: 'server_mtime',
		name: 'server_filename'
	},
	order: ['ascending', 'descending']
}

const RULES = {
	fileName: [
		{ required: true, message: '请输入文件名' },
		{ pattern: REGXS.fileName, message: '文件名不能包含以下字符： \\ / : * ? " < > |' }
	]
}

export default {
	URL,
	BASE,
	ROOT,
	ICONS,
	REGXS,
	SORT,
	MENUS,
	RULES,
	YUN_DATA: new Proxy(
		{},
		{
			get(target, key) {
				return target[key]
			},
			set(target, key, value, proxy) {
				return Reflect.set(target, key, value, proxy)
			}
		}
	)
}
