<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <strong>Quản lý Danh Mục Sản Phẩm</strong>
            <CButton color="success" class="text-white" @click="openAddModal">
              + Thêm Danh Mục
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Tên Danh Mục</CTableHeaderCell>
                  <CTableHeaderCell>Mô tả</CTableHeaderCell>
                  <CTableHeaderCell>Hành Động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-if="categories.length === 0">
                  <CTableDataCell colspan="4" class="text-center text-muted">
                    Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="category in categories" :key="category.id">
                  <CTableDataCell>{{ category.id }}</CTableDataCell>
                  <CTableDataCell class="font-weight-bold">{{ category.categoryName }}</CTableDataCell>
                  <CTableDataCell>{{ category.description }}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" size="sm" class="me-2 text-white" @click="openEditModal(category)">
                      Sửa
                    </CButton>
                    <CButton color="danger" size="sm" class="text-white" @click="deleteCategory(category.id)">
                      Xóa
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal :visible="showModal" @close="showModal = false">
      <CModalHeader>
        <CModalTitle>{{ isEdit ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div class="mb-3">
            <CFormLabel>Tên Danh Mục <span class="text-danger">*</span></CFormLabel>
            <CFormInput
              v-model="form.categoryName"
              placeholder="VD: Laptop, Điện thoại..."
              :invalid="v$.categoryName.$error"
              required
            />
            <CFormFeedback invalid v-if="v$.categoryName.$error">
              {{ v$.categoryName.$errors[0].$message }}
            </CFormFeedback>
          </div>
          <div class="mb-3">
            <CFormLabel>Mô tả</CFormLabel>
            <CFormTextarea
              v-model="form.description"
              rows="3"
              placeholder="Nhập mô tả chi tiết..."
              :invalid="v$.description.$error"
            ></CFormTextarea>
            <CFormFeedback invalid v-if="v$.description.$error">
              {{ v$.description.$errors[0].$message }}
            </CFormFeedback>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showModal = false">Hủy</CButton>
        <CButton color="primary" @click="saveCategory">Lưu Lại</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'

// State quản lý dữ liệu
const categories = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const toast = useToast()

// Cổng của Service Danh mục
const BASE_URL = 'http://localhost:8810'

const form = reactive({
  id: null,
  categoryName: '',
  description: ''
})

const rules = {
  categoryName: {
    required,
    minLength: minLength(2),
    maxLength: maxLength(100)
  },
  description: {
    maxLength: maxLength(500)
  }
}

const v$ = useVuelidate(rules, form)

// Lấy danh sách danh mục từ backend
const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/categories`)
    categories.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      categories.value = [] // Bỏ qua lỗi 404 khi DB trống
    } else {
      console.error('Lỗi khi tải danh mục:', error)
      toast.error('Không thể tải danh sách danh mục')
    }
  }
}

// Hàm dọn dẹp form
const resetForm = () => {
  form.id = null
  form.categoryName = ''
  form.description = ''
  v$.value.$reset()
}

const openAddModal = () => {
  resetForm()
  isEdit.value = false
  showModal.value = true
}

const openEditModal = (category) => {
  form.id = category.id
  form.categoryName = category.categoryName
  form.description = category.description
  isEdit.value = true
  showModal.value = true
}

// Gọi API Thêm hoặc Cập nhật
const saveCategory = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toast.error('Vui lòng kiểm tra lại thông tin nhập!')
    return
  }

  const payload = {
    categoryName: form.categoryName.trim(),
    description: form.description || ''
  }

  try {
    if (isEdit.value) {
      await axios.put(`${BASE_URL}/admin/categories/${form.id}`, payload)
      toast.success('Cập nhật danh mục thành công!')
    } else {
      await axios.post(`${BASE_URL}/admin/categories`, payload)
      toast.success('Thêm mới danh mục thành công!')
    }
    showModal.value = false
    fetchCategories() // Tải lại bảng
  } catch (error) {
    console.error('Lỗi khi lưu danh mục:', error)
    if (error.response?.status === 400) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!')
    } else if (error.response?.status === 409) {
      toast.error('Tên danh mục đã tồn tại!')
    } else {
      toast.error('Có lỗi xảy ra khi lưu danh mục!')
    }
  }
}

// Gọi API Xóa
const deleteCategory = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa danh mục này? LƯU Ý: Nếu danh mục đang có chứa Sản phẩm thì xóa sẽ bị lỗi Database!')) {
    try {
      await axios.delete(`${BASE_URL}/admin/categories/${id}`)
      fetchCategories()
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      alert('Không thể xóa! Rất có thể danh mục này đang được sử dụng bởi một sản phẩm nào đó.')
    }
  }
}

// Tự động chạy khi mở trang
onMounted(() => {
  fetchCategories()
})
</script>
