<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4 shadow-sm">
          <CCardHeader class="d-flex justify-content-between align-items-center bg-white py-3">
            <h5 class="mb-0"><strong>Quản lý Banner</strong></h5>
            <CButton color="success" class="text-white" @click="openAddModal">
              <i class="cil-plus"></i> Thêm Banner
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div v-if="isLoading" class="text-center py-5">
              <CSpinner color="success" />
            </div>

            <CTable v-else hover responsive bordered align="middle">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell class="text-center" style="width: 5%">ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">Tên Banner</CTableHeaderCell>
                  <CTableHeaderCell class="text-center" style="width: 25%">Hình Ảnh</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">Link URL</CTableHeaderCell>
                  <CTableHeaderCell class="text-center" style="width: 10%">Trạng Thái</CTableHeaderCell>
                  <CTableHeaderCell class="text-center" style="width: 5%">Vị trí</CTableHeaderCell>
                  <CTableHeaderCell class="text-center" style="width: 15%">Hành Động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-if="banners.length === 0">
                  <CTableDataCell colspan="7" class="text-center text-muted py-4">
                    Chưa có banner nào.
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="banner in banners" :key="banner.id">
                  <CTableDataCell class="text-center">{{ banner.id }}</CTableDataCell>
                  <CTableDataCell class="fw-bold">{{ banner.name }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <img :src="banner.imageUrl" alt="Banner Image" style="height: 60px; width: auto; border-radius: 4px; max-width: 150px;">
                  </CTableDataCell>
                  <CTableDataCell class="text-muted text-truncate" style="max-width: 200px;">{{ banner.linkUrl || 'N/A' }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CBadge :color="banner.active ? 'success' : 'danger'">
                      {{ banner.active ? 'Hoạt động' : 'Ẩn' }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">{{ banner.position }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CButton color="warning" variant="outline" size="sm" class="me-2" @click="openEditModal(banner)">
                      Sửa
                    </CButton>
                    <CButton color="danger" variant="outline" size="sm" @click="deleteBanner(banner.id)">
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

    <CModal :visible="showModal" @close="showModal = false" backdrop="static">
      <CModalHeader>
        <CModalTitle>{{ isEdit ? 'Sửa Banner' : 'Thêm Banner Mới' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div class="mb-3">
            <CFormLabel>Tên Banner <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="form.name" placeholder="Nhập tên banner" required />
          </div>
          <div class="mb-3">
            <CFormLabel>URL Hình Ảnh <span class="text-danger">*</span></CFormLabel>
            <CFormInput v-model="form.imageUrl" placeholder="Nhập URL hình ảnh" required />
          </div>
          <div class="mb-3">
            <CFormLabel>Link URL (Tùy chọn)</CFormLabel>
            <CFormInput v-model="form.linkUrl" placeholder="Nhập URL khi click vào banner" />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel>Vị trí</CFormLabel>
              <CFormInput type="number" v-model="form.position" />
            </div>
            <div class="col-md-6 mb-3 d-flex align-items-end">
              <CFormCheck label="Hoạt động" v-model="form.active" />
            </div>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" @click="showModal = false">Hủy</CButton>
        <CButton color="primary" @click="saveBanner" :disabled="isSaving">
          {{ isSaving ? 'Đang lưu...' : 'Lưu Lại' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:8900/api/admin/banners'

const banners = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)

const form = ref({
  id: null,
  name: '',
  imageUrl: '',
  linkUrl: '',
  active: true,
  position: 0
})

const fetchBanners = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(API_URL)
    banners.value = response.data
  } catch (error) {
    console.error('Lỗi khi tải banner:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = { id: null, name: '', imageUrl: '', linkUrl: '', active: true, position: 0 }
}

const openAddModal = () => {
  resetForm()
  isEdit.value = false
  showModal.value = true
}

const openEditModal = (banner) => {
  form.value = { ...banner }
  isEdit.value = true
  showModal.value = true
}

const saveBanner = async () => {
  if (!form.value.name || !form.value.imageUrl) {
    alert('Vui lòng nhập đầy đủ tên và URL hình ảnh!')
    return
  }

  isSaving.value = true
  try {
    if (isEdit.value) {
      await axios.put(`${API_URL}/${form.value.id}`, form.value)
      alert('Cập nhật banner thành công!')
    } else {
      await axios.post(API_URL, form.value)
      alert('Thêm banner thành công!')
    }
    showModal.value = false
    fetchBanners()
  } catch (error) {
    console.error('Lỗi khi lưu banner:', error)
    alert('Lưu thất bại!')
  } finally {
    isSaving.value = false
  }
}

const deleteBanner = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      alert('Xóa banner thành công!')
      fetchBanners()
    } catch (error) {
      console.error('Lỗi khi xóa banner:', error)
      alert('Không thể xóa banner!')
    }
  }
}

onMounted(() => {
  fetchBanners()
})
</script>
