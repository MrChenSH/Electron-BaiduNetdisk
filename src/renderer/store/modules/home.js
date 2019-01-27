const state = {
	path: '/',
	files: [],
	quota: { used: 0, total: 1 },
	paths: [{ path: '/', text: '我的网盘' }]
}

const mutations = {
	save(state, data) {
		Object.assign(state, data)
	}
}

const actions = {
	save({ commit }, data) {
		commit('save', data)
	}
}

export default {
	state,
	actions,
	mutations,
	namespaced: true
}
