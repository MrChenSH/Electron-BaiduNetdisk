import electron from 'electron'
import util from './util'
import constant from '../store/constant'

export default Vue => {
	Object.defineProperties(Vue.prototype, {
		$util: {
			get: () => util
		},
		$constant: {
			get: () => constant
		},
		$electron: {
			get: () => electron
		}
	})
}
