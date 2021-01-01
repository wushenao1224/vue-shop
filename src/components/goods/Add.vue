<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息"
                type="info"
                center
                show-icon
                :closable="false">
      </el-alert>
      <!-- 步骤条 -->
      <!-- 字符串 - 0 变为数字 -->
      <el-steps :space="200"
                :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab标签页区域 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top">
        <el-tabs :tab-position="'left'"
                 v-model="activeIndex"
                 :before-leave='beforTabLeave'
                 @tab-click='tabClicked'>
          <el-tab-pane label="基本信息"
                       name='0'>
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model="addForm.goods_price"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model="addForm.goods_weight"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model="addForm.goods_number"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类"
                          prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                           @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数"
                       name='1'>
            <!-- 渲染Item项 -->
            <el-form-item v-for="item in manyTableData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb"
                             v-for="(cb,i) in item.attr_vals"
                             :key="i"
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性"
                       name='2'>
            <el-form-item v-for="item in onlyTableData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片"
                       name='3'>
            <!-- action 表示要上传的后台API地址 -->
            <!-- list-type设定图片显示效果 -->
            <el-upload :action="uploadUrl"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       list-type="picture"
                       :headers="herderObj"
                       :on-success="handleSuccess">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容"
                       name='4'>
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary"
                       class="btnAdd"
                       @click="Add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 预览图片对话框 -->
      <el-dialog title="预览图片"
                 :visible.sync="priviewVisible"
                 width="50%">
        <img :src="priviewPath"
             class="priviewImg">
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 深拷贝依赖
import _ from 'lodash'
export default {
  data () {
    return {
      // 步骤条激活索引
      activeIndex: '0',
      // 表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选中的数组
        goods_cat: [],
        // 图片数组
        pics: [],
        goods_introduce: '',
        // 商品参数数组
        attrs: []
      },
      // 表单数据的验证
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称！', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格！', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量！', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量！', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类！', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品动态参数
      manyTableData: [],
      // 商品静态属性
      onlyTableData: [],
      // 上传图片路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      herderObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      priviewPath: '',
      // 预览对话框的显示于隐藏
      priviewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.cateList = res.data
    },
    // 监听级联选择器变化事件
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.warning('请选择三级分类')
      }
    },
    // 监听标签页的切换
    beforTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 点击标签页触发事件
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败！')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性失败！')
        this.onlyTableData = res.data
      }
    },
    // 点击图片时触发，处理图片预览效果
    handlePreview (file) {
      // file代表选中的图片对象数据
      this.priviewPath = file.response.data.url
      this.priviewVisible = true
    },
    // 处理移除图片的操作
    handleRemove (file) {
      // file代表将要移除的对象数据
      // 1.获取将要移除的临时图片路径
      const filePath = file.response.data.tmp_path
      // 2.使用过滤函数移除数据
      this.addForm.pics = this.addForm.pics.filter(item => {
        if (item.pic === filePath) {
          return false
        }
        return true
      })
      // console.log(this.addForm.pics)
    },
    // 监听上传成功的回调函数
    handleSuccess (response) {
      // response为得到的返回值信息
      // 1.拼接得到一个图片信息
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息 push 到 pic数组中
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    Add () {
      // 表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要信息！')
        // 执行添加商品逻辑
        // lodash  cloneDeep(Obj)深拷贝数据信息，返回新对象
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功过！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 1rem 0 0 !important;
}
.priviewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 1rem;
}
</style>
