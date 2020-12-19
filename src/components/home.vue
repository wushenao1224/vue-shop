/* eslint-disable vue/valid-v-for */
<template>
   <el-container class="home-container">
     <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="exit">退出</el-button></el-header>
    <!-- 主体内容区域 -->
    <el-container>
      <!-- 左边侧边栏区域 -->
      <el-aside :width="isCollapse ? '6.4rem' : '20rem'">
        <!-- 单击导航栏缩小按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 导航栏区域 -->
         <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#60a2f4"
          unique-opened
          :collapse='isCollapse'
          :collapse-transition='false'
          router
          :default-active="activePath">
          <!-- default-active接收string，标识某一个子导航栏高亮 -->
          <!-- router开启子导航的router属性，变成访问链接 -->
          <!-- collapse-transition导航栏是否有动画 -->
          <!-- collapse导航栏是否折叠 -->
          <!-- 默认值打开一个子菜单 -->
          <!-- index只接收字符串不接收数值，否则会报错 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + itemsub.path" v-for="itemsub in item.children" :key="itemsub.id" @click="saveNavState('/' + itemsub.path)">
              <i class="el-icon-menu"></i>
              <span slot="title">{{itemsub.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边主体区域 -->
      <el-main>
        <!-- 添加路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created () {
    this.getMeunList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 选中高亮index地址
      activePath: ''
    }
  },
  methods: {
    exit () {
      // 清除token
      window.sessionStorage.clear()
      // 编程式导航跳转页面
      this.$router.push('/login')
    },
    async getMeunList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 当前选中的index高亮
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
  .el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 2rem;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 1.5rem;
    }
  }
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right: none;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont{
    margin-right: 1rem;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 1rem;
    line-height: 2.4rem;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }
}
</style>
