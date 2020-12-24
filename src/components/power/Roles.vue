<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 添加角色列表区域 -->
      <el-row>
        <el-button type="primary"
                   @click="addDialogVisible = true">添加角色</el-button>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList"
                border
                stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vscenter']"
                    v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限与三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop','vscenter']"
                        v-for="(item2,i2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id"
                            closable
                            @close="removeRightById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"
                         label="#"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
                         width="300px">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       :data="scope.row"
                       @click="editFormClick(scope.row.id)">编辑</el-button>
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete"
                       @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button size="mini"
                       type="warning"
                       icon="el-icon-setting"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

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
                 label-width="90px">
          <el-form-item label="角色名称"
                        prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        prop="roleDesc">
            <el-input type="textarea"
                      v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addRoles">保存</el-button>
        </span>
      </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog title="修改用户"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClose">
        <!-- @close 监听对话框关闭事件 -->
        <!-- visible.sync用来控制对话框显示与隐藏 传布尔值 -->
        <!-- 添加form提交表单 -->
        <el-form :model="editForm"
                 :rules="editFormRules"
                 ref="editFormRef"
                 label-width="90px">
          <el-form-item label="角色ID"
                        prop="roleId">
            <el-input v-model="editForm.roleId"
                      disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称"
                        prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        prop="roleDesc">
            <el-input type="textarea"
                      v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editRole">保存</el-button>
        </span>
      </el-dialog>
      <!-- 角色分配对话框 -->
      <el-dialog title="分配权限"
                 :visible.sync="setRightDialogVisible"
                 width="50%"
                 @close="setRightDialogClose">
        <!-- 树形控件 -->
        <!-- :data代表提供的数据 -->
        <!-- :props表示提供树形控件的规则   label名称 children子节点 -->
        <!-- show-checkbox 变成checkbox -->
        <!-- lazy懒加载叶子 -->
        <!-- default-checked-keys默认选中的node-key的唯一值 -->
        <el-tree :data="rightsList"
                 :props="treeProps"
                 show-checkbox
                 node-key='id'
                 default-expand-all
                 :default-checked-keys="defKeys"
                 ref="treeRef">
        </el-tree>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有用户列表信息
      roleList: [],
      // 添加用户对话框的显示隐藏
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3~10个字符之间', trigger: 'blur' }
        ]
      },
      // 修改角色信息
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 修改角色的规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3~10字符之间', trigger: 'blur' }
        ]
      },
      // 修改角色框的显示
      editDialogVisible: false,
      // 分配权限框的显示
      setRightDialogVisible: false,
      // 所有权限数组
      rightsList: [],
      // 树形控件的规则
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形控件默认选中的keys
      defKeys: [],
      // 当前用户的ID
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.roleList = res.data
    },
    // 添加用户事件
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('创建角色失败！')
        this.$message.success('添加角色成功！')
        this.getRoleList()
        this.addDialogVisibl = false
      })
    },
    // 关闭dialog需要做的事情
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 删除指定用户
    async removeRoleById (id) {
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
      // 进行用户的删除
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除与角色失败！！')
      this.$message.success('删除此角色成功！！')
      this.getRoleList()
    },
    // 修改按钮的点击
    async editFormClick (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取用户信息失败！')
      this.editForm = res.data
    },
    // 保存修改角色信息
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 进行用户的修改
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败！')
        this.$message.success('修改用户成功！')
        this.editDialogVisible = false
        this.getRoleList()
      })
    },
    // 修改用户对话框关闭监听
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightID) {
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
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightID}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      // this.getRoleList()
      // 将返回的最新的权限数据直接返回当前权限数据
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 保存当前用户的ID
      this.roleId = role.id
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败！')
      this.rightsList = res.data
      // 获取所有当前角色所有权限
      this.getLeafkeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到 defKeys 数组中
    getLeafkeys (node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafkeys(item, arr))
    },
    // 关闭权限对话框刷新数组
    setRightDialogClose () {
      this.defKeys = []
    },
    // 分配权限
    async allotRights () {
      // getCheckedKeys用于获取所有全选中的keys返回数组，getHalfCheckedKeys 所有半选中节点的数组
      const checkKeys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // API中需要接收 ‘,’的字符串数组
      const checkKeysString = checkKeys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: checkKeysString
      })
      if (res.meta.status !== 200) return this.$message.error('修改权限失败！')
      this.$message.success('修改权限成功！')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 0.8rem;
}
.bdtop {
  border-top: 0.1rem solid #eee;
}
.bdbottom {
  border-bottom: 0.1rem solid #eee;
}
.vscenter {
  display: flex;
  align-items: center;
}
</style>
