const API = {
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
	mix: {
		src: 'static/images/FileType/Middle/MixFileType.png'
	},
	dir: {
		src: 'static/images/FileType/Middle/FolderType.png'
	},
	apps: {
		src: 'static/images/FileType/Middle/Apps.png'
	},
	default: {
		src: 'static/images/FileType/Middle/OtherType.png'
	},
	image: {
		regex: /\.(gif|jpg|jpeg|png|bmp)$/,
		src: 'static/images/FileType/Middle/ImgType.png'
	},
	video: {
		src: 'static/images/FileType/Middle/VideoType.png',
		regex: /\.(avi|wmv|mpeg|mp4|mov|mkv|flv|f4v|m4v|rmvb|rm|3gp|vob)$/
	},
	audio: {
		regex: /\.(mp3|wav|m4a|ape|flac|ape|ogg)$/,
		src: 'static/images/FileType/Middle/MusicType.png'
	},
	archive: {
		src: 'static/images/FileType/Middle/RarType.png',
		regex: /\.(zip|rar|7z|cab|tgz|tar.gz|tar.xz|lz|deb)$/
	},
	code: {
		regex: /\.(java|js|c|ts|json)$/,
		src: 'static/images/FileType/Middle/CodeType.png'
	},
	font: {
		regex: /\.(font|ttf)$/,
		src: 'static/images/FileType/Middle/FontType.png'
	},
	doc: {
		regex: /\.(doc|docx)$/,
		src: 'static/images/FileType/Middle/DocType.png'
	},
	xls: {
		regex: /\.(xls|xlsx)$/,
		src: 'static/images/FileType/Middle/XlsType.png'
	},
	ppt: {
		regex: /\.(ppt|pptx)$/,
		src: 'static/images/FileType/Middle/PptType.png'
	},
	text: {
		regex: /\.(txt|log|ini|properties)$/,
		src: 'static/images/FileType/Middle/TxtType.png'
	},
	apk: {
		regex: /\.(apk)$/,
		src: 'static/images/FileType/Middle/ApkType.png'
	},
	pdf: {
		regex: /\.(pdf)$/,
		src: 'static/images/FileType/Middle/PdfType.png'
	},
	exe: {
		regex: /\.(exe|iso)$/,
		src: 'static/images/FileType/Middle/ExeType.png'
	},
	torrent: {
		regex: /\.(torrent)$/,
		src: 'static/images/FileType/Middle/TorrentType.png'
	}
}

const REGXS = {
	/**
	 * 校验文件名是否合法
	 */
	fileName: /^[^\\\\/:*?\"<>|]+$/
}

/**
 * category文件分类 1视频，2音乐，3图片，4文档。。。
 */
const CATEGORY = [
	{
		text: '最近使用',
		icon: 'el-icon-time'
	},
	{
		url: API.list,
		text: '全部文件',
		icon: 'el-icon-tickets'
	},
	{
		category: 3,
		text: '图片',
		url: API.categorylist,
		icon: 'el-icon-picture-outline'
	},
	{
		category: 1,
		text: '视频',
		url: API.categorylist,
		icon: 'el-icon-',
		svg: 'video'
	},
	{
		category: 4,
		text: '文档',
		url: API.categorylist,
		icon: 'el-icon-document'
	},
	{
		category: 2,
		text: '音乐',
		url: API.categorylist,
		icon: 'el-icon-service'
	},
	{
		category: 7,
		text: '种子',
		url: API.categorylist,
		svg: 'torrent',
		icon: 'el-icon-'
	},
	{
		category: 6,
		text: '其它',
		url: API.categorylist,
		icon: 'el-icon-star-off'
	},
	{
		text: '隐藏空间',
		icon: 'el-icon-',
		svg: 'lock'
	},
	{
		text: '我的分享',
		url: API.share,
		icon: 'el-icon-',
		svg: 'share'
	},
	{
		text: '回收站',
		url: API.recycle,
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
	API,
	BASE,
	ROOT,
	SORT,
	ICONS,
	REGXS,
	RULES,
	CATEGORY,
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
