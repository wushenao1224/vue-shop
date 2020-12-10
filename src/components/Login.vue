/* eslint-disable no-useless-return */
<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="LoginFormRef" class="login-form" :model="LoginForm" :rules="rules">
        <!-- 用戶名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="LoginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!-- 密碼 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="LoginForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <!-- 登錄以及重置按鈕 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // Form表单数据绑定对象
      LoginForm: {
        username: '',
        password: ''
      },
      //   Form表单校验规则
      rules: {
        //   用户名的规则
        username: [
          { required: true, message: '请输入您的名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 密码的规则
        password: [
          { required: true, message: '请输入您的密码', trigger: 'blur' },
          { min: 6, message: '密码不得小于6个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //   重置按钮的点击
    resetLoginForm () {
      // 表单中的ref属性，是声明对象的引用
      // this.$refs.对象引用名称获取某一个对象引用
      this.$refs.LoginFormRef.resetFields()
    },
    // 表单登录验证
    login () {
      // 表单对象的validate对象中传递一个函数，参数为布尔值，当符合结果返回为true,反之flase
      this.$refs.LoginFormRef.validate(async (valid) => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 返回结果为promise通过await简化promise操作,简化promise.then操作
        // eslint-disable-next-line no-unused-vars
        const { data: res } = await this.$http.post('login', this.LoginForm)
        // result.then(resolve => console.log(resolve))
        // eslint-disable-next-line eqeqeq
        if (res.meta.status != 200) return this.$message.error('登录失败！！！')
        this.$message.success('登录成功！')
        // 1.将登录之后的 token ,保存到客户端的sessionStorage中
        //    1.1项目中除了登录之外的其他API接口，必须在登录之后才能访问
        //    1.2token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台页面，路由地址为 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
}
.login-box {
  width: 45rem;
  height: 30rem;
  background-color: white;
  border-radius: 0.3rem;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  // 利用less属性可直接加在父元素里面写样式
  .avatar_box {
    height: 13rem;
    width: 13rem;
    border: 0.1rem solid #eee;
    border-radius: 50%;
    padding: 1rem;
    // 设置阴影
    box-shadow: 0 0 1rem #ddd;
    // position
    position: absolute;
    left: 50%;
    // translate相对自身元素宽高进行偏移
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      // 图片填充整个div
      width: 100%;
      height: 100%;
      // 图片变成圆形
      border-radius: 50%;
      // 设置图片背景颜色
      background-color: #eee;
    }
  }
  // 表單的樣式
  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;

    .btns {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
