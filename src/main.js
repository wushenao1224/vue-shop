import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体文件
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入我们的axios
// eslint-disable-next-line no-unused-vars
import axios from 'axios'
// 导入treeTable插件
import treeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 设置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂载请求拦截器
axios.interceptors.request.use(config => {
  // 为请求头添加访问权限
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return出这个config
  return config
})
// 每次使用axios时可直接使用this.$http
Vue.prototype.$http = axios

Vue.config.productionTip = false
// treeTable注册为全局可用的组件
Vue.component('tree-table', treeTable)
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)
// 定义时间转换过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
