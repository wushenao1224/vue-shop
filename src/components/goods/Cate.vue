/* eslint-disable vue/no-parsing-error */
<template>
  <!-- 编辑以及删除未完成 -->
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <!-- 使用tree-table需要先下载运行插件vue-table-with-tree-grid
            然后导入此插件，注册为Vue全局组件Vue.component('tree-table') -->
      <tree-table :data='cateList'
                  :columns='columns'
                  :selection-type='false'
                  :expand-type='false'
                  show-index
                  index-text='#'
                  border
                  :show-row-hover='false'>
        <!-- data属性表示绑定的数据源 -->
        <!-- columns表示定义每列显示的规则 -->
        <!-- selection-type是否为多选表格类型 -->
        <!-- expand-type是否为展开行类型表格 -->
        <!-- show-index是否显示序号 -->
        <!-- show-row-hover是否鼠标悬停显示高亮  -->
        <!-- v-slot不能与slot-scope一起使用 -->
        <!-- 使用v-slot:名称='scope' -->

        <!-- 是否有效 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted === false"
             style="color: lightgreen;"></i>
          <i class="el-icon-error"
             v-else
             style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order='scope'>
          <el-tag size="mini"
                  v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success"
                  size="mini"
                  v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning"
                  size="mini"
                  v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt='scope'>
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="mini"
                     @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="mini"
                     @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[2, 5, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类"
                 :visible.sync="addCateDialogVisible"
                 width="50%"
                 @close="addCateDialogClose">
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm"
                 :rules="addCateFormRules"
                 ref="addCateFormRef"
                 label-width="100px">
          <el-form-item label="分类名称："
                        prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- options 用来指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <el-cascader v-model="selectedKeys"
                         :options="parentCateList"
                         :props="cascaderProps"
                         @change="parentCateChanged"
                         clearable></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类的对话框 -->
      <el-dialog title="提示"
                 :visible.sync="
                 editCateDialogVisible"
                 width="50%">
        <!-- 修改分类的表单 -->
        <el-form :model="editCateForm"
                 :rules="editCateFormRules"
                 ref="editCateFormRef"
                 label-width="100px">
          <el-form-item label="分类名称"
                        prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示，当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加商品分类对话框控制
      addCateDialogVisible: false,
      // 添加分类数据
      addCateForm: {
        // 添加分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是 一级分类
        cat_level: 0
      },
      // 添加分类表单的规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // checkStrictly是否可以选择任意节点
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制修改对话框的显示与隐藏
      editCateDialogVisible: false,
      // 修改对话框数据对象
      editCateForm: {
        cat_name: ''
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称!', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 页面加载获取分类数据
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      // 把数据列表赋值给 cateList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
      // console.log(res.data)
    },
    // 监听 pagesize 数据的改变
    handleSizeChange (newPage) {
      this.queryInfo.pagesize = newPage
      this.getCateList()
    },
    // 监听 pagenum 数据的改变
    handleCurrentChange (newCurrent) {
      this.queryInfo.pagenum = newCurrent
      this.getCateList()
    },
    // 单击添加商品分类
    showAddCateDialog () {
      // 先获取父级分类数据
      this.getParentCateList()
      // 再进行页面的展示
      this.addCateDialogVisible = true
    },
    // 获取父级分类的列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      this.parentCateList = res.data
    },
    // 选择项发生变化出发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length > 0 ，证明选中的父级分类
      // 分之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级  分类等级0，1，2
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // console.log(this.addCateForm)
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 添加分类对话款关闭事件
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      // 重置级联选择器数据
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击编辑按钮，显示对话框
    // eslint-disable-next-line camelcase
    async showEditDialog (cat_id) {
      // eslint-disable-next-line camelcase
      const { data: res } = await this.$http.get(`categories/${cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('获取此分类名称失败！')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 修改分类属性
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改分类名称失败！')
        this.$message.success('修改分类名称成功！')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 删除指定分类
    async removeCate (cateId) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除操作！')
      }
      const { data: res } = await this.$http.delete(`categories/${cateId}`)
      if (res.meta.status !== 200) return this.$message.error('删除此分类失败！')
      this.$message.success('删除分类成功！')
      this.queryInfo.pagenum = 1
      this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped>
.zk-table {
  margin-top: 1.5rem;
}
.el-cascader {
  width: 100%;
}
</style>
