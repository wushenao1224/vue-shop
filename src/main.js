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

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
