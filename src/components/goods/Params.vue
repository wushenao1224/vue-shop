<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <!-- closable是否有关闭按钮 -->
      <!-- show-icon显示图标 -->
      <el-alert title="警告提示的文案"
                type="warning"
                :closable="false"
                show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys"
                       :options="cateList"
                       :props="cateProps"
                       @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab 页签区域的绘制 -->
      <el-tabs v-model="activeName"
               @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数"
                     name="many">
          <!-- 动态参数按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isButtonDisabled"
                     @click="AddDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        closable
                        @close="handleTagClose(i,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Param</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性"
                     name="only">
          <!-- 静态属性的按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isButtonDisabled"
                     @click="AddDialogVisible = true">添加属性</el-button>
          <!--静态属性表格 -->
          <el-table :data="onlyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        closable
                        @close="handleTagClose(i,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Param</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column label="属性名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数的对话框 -->
      <el-dialog :title="'添加'
                           +
                           textTitle"
                 :visible.sync="AddDialogVisible"
                 width="50%"
                 @close="addDialogClosed">
        <!-- 添加表单 -->
        <el-form :model="addForm"
                 :rules="addFormRules"
                 ref="addFormRef"
                 label-width="100px">
          <el-form-item :label="textTitle"
                        prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="AddDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数的对话框 -->
      <!-- 多选按钮 ctrl + d -->
      <el-dialog :title="'修改' + textTitle"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClosed">
        <!-- 添加表单 -->
        <el-form :model="editForm"
                 :rules="editFormRules"
                 ref="editFormRef"
                 label-width="100px">
          <el-form-item :label="textTitle"
                        prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类数据列表
      cateList: [],
      // 级联选择器的规则
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择的数组
      selectedCateKeys: [],
      // 判断是否选中那个标签页
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      AddDialogVisible: false,
      // 添加表单的数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改表单的数据对象
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取商品分类数据列表
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      // 将获取到的商品列表赋值给cateList
      this.cateList = res.data
    },
    // 监听级联选择其改变事件
    handleChange () {
      this.getParamsData()
    },
    // 监听标签页点击
    handleTabClick () {
      this.getParamsData()
    },
    async getParamsData () {
      // 判断是否为三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$message.warning('请选择第三级分类')
        return
      }
      // console.log(this.selectedCateKeys)
      // 根据选中的 cateID 以及选中的标签页 获取指定的参数列表
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        // 控制tag与input的显示与隐藏
        element.inputVisible = false
        // 展开列中数据绑定
        element.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加参数对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.AddDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击编辑，显示修改对话框
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数事件
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 删除参数事件
    async removeParams (attrId) {
      const confirmResulf = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResulf !== 'confirm') return this.$message.info('取消删除！')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 展开列中安enter 与 焦点消失触发的事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        // eslint-disable-next-line no-useless-return
        return
      }
      // 如果没有return 则证明输入的内容，需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 修改参数
      this.saveAttrVals(row)
    },
    // 单击展开列中按钮触发事件
    showInput (row) {
      row.inputVisible = true
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，
      // 才会执行回到函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的数据可选项
    handleTagClose (index, row) {
      row.attr_vals.splice(index, 1)
      // 修改参数
      this.saveAttrVals(row)
    },
    // 将 attr_vals 中数据进行保存数据库
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败！')
      this.$message.success('修改参数成功！')
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    // 如果按钮需要禁用，则返回为true反之返回为false
    isButtonDisabled () {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 获取当前选中商品id
    cateId () {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    // 切换标题信息
    textTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 1.5rem 0;
  font-size: 1.6rem;
}
.el-tag {
  margin: 1rem;
}
.input-new-tag {
  width: 10rem;
}
</style>
