<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <strong>Quản lý Sản Phẩm</strong>
            <CButton color="primary" @click="openAddModal">
              + Thêm Sản Phẩm
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Tên Sản Phẩm</CTableHeaderCell>
                  <CTableHeaderCell>Giá ($)</CTableHeaderCell>
                  <CTableHeaderCell>Danh Mục</CTableHeaderCell>
                  <CTableHeaderCell>Số Lượng</CTableHeaderCell>
                  <CTableHeaderCell>Hành Động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-if="products.length === 0">
                  <CTableDataCell colspan="6" class="text-center">
                    Chưa có sản phẩm nào.
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="product in products" :key="product.id">
                  <CTableDataCell>{{ product.id }}</CTableDataCell>
                  <CTableDataCell>{{ product.productName }}</CTableDataCell>
                  <CTableDataCell>{{ product.price }}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">{{ product.category ? product.category.categoryName : 'N/A' }}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{{ product.availability }}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" size="sm" class="me-2 text-white" @click="openEditModal(product)">
                      Sửa
                    </CButton>
                    <CButton color="danger" size="sm" class="text-white" @click="deleteProduct(product.id)">
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
        <CModalTitle>{{ isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div class="mb-3">
            <CFormLabel>Tên Sản Phẩm <span class="text-danger">*</span></CFormLabel>
            <CFormInput
              v-model="form.productName"
              placeholder="Nhập tên sản phẩm..."
              :invalid="v$.productName.$error"
              required
            />
            <CFormFeedback invalid v-if="v$.productName.$error">
              {{ v$.productName.$errors[0].$message }}
            </CFormFeedback>
          </div>
          <div class="mb-3">
            <CFormLabel>Giá ($) <span class="text-danger">*</span></CFormLabel>
            <CFormInput
              type="number"
              step="0.01"
              v-model.number="form.price"
              placeholder="Ví dụ: 99.99"
              :invalid="v$.price.$error"
              required
            />
            <CFormFeedback invalid v-if="v$.price.$error">
              {{ v$.price.$errors[0].$message }}
            </CFormFeedback>
          </div>
       <div class="mb-3">
            <CFormLabel>Danh Mục <span class="text-danger">*</span></CFormLabel>
            <select
              class="form-select"
              v-model="form.categoryId"
              :class="{ 'is-invalid': v$.categoryId.$error }"
              required
            >
              <option value="" disabled>-- Chọn danh mục --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.categoryName }}
              </option>
            </select>
            <div v-if="v$.categoryId.$error" class="invalid-feedback d-block">
              {{ v$.categoryId.$errors[0].$message }}
            </div>
          </div>
          <div class="mb-3">
            <CFormLabel>Số Lượng (Kho) <span class="text-danger">*</span></CFormLabel>
            <CFormInput
              type="number"
              v-model.number="form.availability"
              :invalid="v$.availability.$error"
              required
            />
            <CFormFeedback invalid v-if="v$.availability.$error">
              {{ v$.availability.$errors[0].$message }}
            </CFormFeedback>
          </div>
          <div class="mb-3">
            <CFormLabel>Mô tả</CFormLabel>
            <CFormTextarea
              v-model="form.discription"
              rows="3"
              :invalid="v$.discription.$error"
            ></CFormTextarea>
            <CFormFeedback invalid v-if="v$.discription.$error">
              {{ v$.discription.$errors[0].$message }}
            </CFormFeedback>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="showModal = false">Hủy</CButton>
        <CButton color="primary" @click="saveProduct">Lưu Lại</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators'

// State
const products = ref([])
const categories = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const toast = useToast()

// URL của Backend
const BASE_URL = 'http://localhost:8810'

const form = reactive({
  id: null,
  productName: '',
  price: 0,
  categoryId: '',
  availability: 0,
  discription: ''
})

const rules = {
  productName: {
    required,
    minLength: minLength(2),
    maxLength: maxLength(200)
  },
  price: {
    required,
    minValue: minValue(0.01),
    maxValue: maxValue(999999.99)
  },
  categoryId: {
    required
  },
  availability: {
    required,
    minValue: minValue(0)
  },
  discription: {
    maxLength: maxLength(1000)
  }
}

const v$ = useVuelidate(rules, form)

// Lấy danh sách Sản phẩm
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/products`)
    products.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      products.value = []
    } else {
      console.error('Lỗi khi tải sản phẩm:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    }
  }
}

// Lấy danh sách Danh mục
const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/categories`)
    categories.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      categories.value = []
    } else {
      console.error('Lỗi khi tải danh mục:', error)
      toast.error('Không thể tải danh sách danh mục')
    }
  }
}

// Reset form
const resetForm = () => {
  form.id = null
  form.productName = ''
  form.price = 0
  form.categoryId = ''
  form.availability = 0
  form.discription = ''
  v$.value.$reset()
}

const openAddModal = () => {
  resetForm()
  isEdit.value = false
  showModal.value = true
}

const openEditModal = (product) => {
  form.id = product.id
  form.productName = product.productName
  form.price = product.price
  form.categoryId = product.category ? product.category.id : ''
  form.availability = product.availability
  form.discription = product.discription
  isEdit.value = true
  showModal.value = true
}

// Lưu (POST / PUT)
const saveProduct = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toast.error('Vui lòng kiểm tra lại thông tin nhập!')
    return
  }

  const payload = {
    productName: form.productName.trim(),
    price: form.price,
    discription: form.discription || '',
    availability: form.availability,
    category: {
      id: form.categoryId
    }
  }

  try {
    if (isEdit.value) {
      await axios.put(`${BASE_URL}/admin/products/${form.id}`, payload)
      toast.success('Cập nhật sản phẩm thành công!')
    } else {
      await axios.post(`${BASE_URL}/admin/products`, payload)
      toast.success('Thêm mới sản phẩm thành công!')
    }
    showModal.value = false
    fetchProducts() // Load lại bảng sau khi lưu
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error)
    if (error.response?.status === 400) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!')
    } else if (error.response?.status === 409) {
      toast.error('Tên sản phẩm đã tồn tại!')
    } else {
      toast.error('Có lỗi xảy ra khi lưu sản phẩm!')
    }
  }
}

// Xóa Sản phẩm
const deleteProduct = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    try {
      await axios.delete(`${BASE_URL}/admin/products/${id}`)
      toast.success('Xóa sản phẩm thành công!')
      fetchProducts()
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      toast.error('Không thể xóa sản phẩm!')
    }
  }
}

// Chạy khi component mount
onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
