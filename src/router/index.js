import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import login from '../components/Login.vue'
import home from '../components/home.vue'

Vue.use(Router)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login },
  { path: '/home', component: home }
]
const router = new Router({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to and from are Route Object,next() must be called to resolve the hook}
  // to 将要访问的路径
  // from 代表哪个路径跳转而来
  // next 是一个函数表示放行
  //      next() 放行    next('路径') 强制跳转
  if (to.path === '/login') return next()
  // 获取token获取，判断是否存在，判断token是否过期
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
