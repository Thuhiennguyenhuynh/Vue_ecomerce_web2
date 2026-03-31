<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="handleLogin">
                  <h1>Đăng Nhập Admin</h1>
                  <p class="text-body-secondary">Đăng nhập vào hệ thống quản trị</p>

                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="form.email"
                      type="email"
                      placeholder="Email"
                      autocomplete="email"
                      :invalid="v$.email.$error"
                      required
                    />
                    <CFormFeedback invalid v-if="v$.email.$error">
                      {{ v$.email.$errors[0].$message }}
                    </CFormFeedback>
                  </CInputGroup>

                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="form.password"
                      type="password"
                      placeholder="Mật khẩu"
                      autocomplete="current-password"
                      :invalid="v$.password.$error"
                      required
                    />
                    <CFormFeedback invalid v-if="v$.password.$error">
                      {{ v$.password.$errors[0].$message }}
                    </CFormFeedback>
                  </CInputGroup>

                  <CRow>
                    <CCol :xs="6">
                      <CButton color="primary" type="submit" class="px-4" :disabled="loading">
                        <CSpinner v-if="loading" size="sm" />
                        {{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
                      </CButton>
                    </CCol>
                    <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0">
                        Quên mật khẩu?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white bg-primary py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <h2>Đăng Ký</h2>
                  <p>
                    Tạo tài khoản admin mới để quản lý hệ thống.
                  </p>
                  <CButton color="light" variant="outline" class="mt-3" @click="router.push('/register')">
                    Đăng Ký Ngay!
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: {
    required,
    email
  },
  password: {
    required,
    minLength: minLength(6)
  }
}

const v$ = useVuelidate(rules, form)

const handleLogin = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  loading.value = true

  const result = await authStore.login(form.email, form.password)

  loading.value = false

  if (result.success) {
    toast.success('Đăng nhập thành công!')
    router.push('/dashboard')
  } else {
    toast.error(result.message)
  }
}
</script>
