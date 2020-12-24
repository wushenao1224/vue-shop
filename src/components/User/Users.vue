<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 头部搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clearable出现可清空的按钮 点击按钮后触发clear事件 -->
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getUserList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <!-- :data需要渲染的数组 -->
      <!-- border添加边框 stripe隔行换色 -->
      <el-table :data="userList"
                border
                stripe>
        <!-- 添加表格索引列 -->
        <el-table-column type="index"
                         label="#"></el-table-column>
        <!-- label表格头部名称   prop表格自动渲染数组中对象的key -->
        <el-table-column label="姓名"
                         prop="username"></el-table-column>
        <el-table-column label="邮箱"
                         prop="email"></el-table-column>
        <el-table-column label="电话"
                         prop="mobile"></el-table-column>
        <el-table-column label="角色"
                         prop="role_name"></el-table-column>
        <el-table-column label="状态"
                         prop="mg_state">
          <template slot-scope="scope">
            <!-- change事件用来监听switch事件的改变 -->
            <el-switch v-model="scope.row.mg_state"
                       @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="180rem">
          <!-- 使用作用域插槽获取父组件数据 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark"
                        content="修改"
                        placement="top"
                        :enterable='false'>
              <el-button type="primary"
                         icon="el-icon-edit"
                         @click="showEditDialog(scope.row.id)"
                         :data='scope.row.username'
                         size="mini"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark"
                        content="删除"
                        placement="top"
                        :enterable='false'>
              <el-button type="danger"
                         icon="el-icon-delete"
                         @click="removeUserById(scope.row.id)"
                         size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark"
                        content="分配角色"
                        placement="top"
                        :enterable='false'>
              <el-button type="warning"
                         icon="el-icon-setting"
                         size="mini"
                         @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果的实现 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[1, 2, 5, 10]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
        <!-- layout用于控制页面显示信息有哪些 total代表总共页数的头。。。 -->
      </el-pagination>
      <!-- 添加对话框 -->
      <el-dialog title="添加用户"
                 :visible.sync="addDialogVisible"
                 width="50%"
                 @close="addDialogClose">
        <!-- @close 监听对话框关闭事件 -->
        <!-- visible.sync用来控制对话框显示与隐藏 传布尔值 -->
        <!-- 添加form提交表单 -->
        <el-form :model="addForm"
                 :rules="addFormRules"
                 ref="addFormRef"
                 label-width="70px">
          <el-form-item label="用户名"
                        prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码"
                        prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱"
                        prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号"
                        prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addUser">保存</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClosed">
        <!-- @close 监听对话框关闭事件 -->
        <!-- visible.sync用来控制对话框显示与隐藏 传布尔值 -->
        <!-- 添加form提交表单 -->
        <el-form :model="editForm"
                 :rules="editFormRules"
                 ref="editFormRef"
                 label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username"
                      disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱"
                        prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号"
                        prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog title="分配角色"
                 :visible.sync="setRoleDialogVisible"
                 width="50%"
                 @close="selectedRoleId = ''">
        <div>
          <p>当前的用户:{{userInfo.username}}</p>
          <p>当前的角色:{{userInfo.role_name}}</p>
          <p>分配新角色:
            <el-select v-model="selectedRoleId"
                       placeholder="请选择">
              <el-option v-for="item in rolesList"
                         :key="item.id"
                         :label="item.roleName"
                         :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created () {
    this.getUserList()
  },
  data () {
    // 验证邮箱规则
    // eslint-disable-next-line no-unused-vars
    var checkEmail = (rule, value, cb) => {
      // value代表当前值
      // cb代表回调函数
      const regEmail = /^([a-zA-Z0-9_-]+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]))/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 添加表单的验证规则
    // eslint-disable-next-line no-unused-vars
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页码多少
        pagenum: 1,
        // 每页显示的个数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 用户添加对话框是否显示
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { type: 'email', required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入您的手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号的长度为11位', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 用户修改对话框控制
      editDialogVisible: false,
      // 修改用户对象
      editForm: {},
      // 修改表单的验证规则
      editFormRules: {
        email: [
          { type: 'email', required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入您的手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号的长度为11位', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框显示
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 选中的角色ID
      selectedRoleId: ''
    }
  },
  methods: {
    async getUserList () {
      if (this.queryInfo.query) this.queryInfo.pagenum = 1
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 currentpage 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听dialog对话框关闭事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 单击按钮，提交用户信息
    addUser () {
      // form表单引用大的valdate判断表单验证是否成功
      // 接收布尔值函数
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请检查信息是否正确')
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败！')
        this.$message.success('添加用户成功！')
        // 隐藏dialog对话框
        this.addDialogVisible = false
        // 重新获取用户数据
        this.getUserList()
      })
    },
    // 点击修改按钮
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户信息对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改表单的验证以及提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 发起用户修改的数据请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('更新用户信息失败！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 根据ID删除对应的用户信息
    async removeUserById (id) {
      // 弹框询问用户是否删除数据
      // this.$confirm返回值为promise对象
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      this.$message.success('删除用户成功！')
      // 重新刷新页面
      this.getUserList()
    },
    // 分配角色
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色！')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
</style>
