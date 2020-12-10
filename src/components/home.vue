<template>
   <div>
    <el-button type="info" @click="exit">退出</el-button>
   </div>
</template>

<script>
export default {
  methods: {
    exit () {
      // 清除token
      window.sessionStorage.clear()
      // 编程式导航跳转页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
