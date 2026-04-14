<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const breadcrumbs = ref()
const route = useRoute()
const router = useRouter()

const getBreadcrumbs = () => {
  return route.matched.map((r) => {
    return {
      active: r.path === route.fullPath,
      name: r.name,
      path: `${router.options?.history?.base || ''}${r.path}`,
    }
  })
}

// Thay vì dùng router.afterEach (dễ gây memory leak nếu component unmount),
// chuẩn Vue 3 là dùng watch để theo dõi sự thay đổi của route
watch(
  () => route.path,
  () => {
    breadcrumbs.value = getBreadcrumbs()
  }
)

onMounted(() => {
  breadcrumbs.value = getBreadcrumbs()
})
</script>

<template>
  <CBreadcrumb class="my-0">
    <CBreadcrumbItem
      v-for="item in breadcrumbs"
      :key="item.path"
      :href="item.active ? '' : item.path"
      :active="item.active"
    >
      {{ item.name }}
    </CBreadcrumbItem>
  </CBreadcrumb>
</template>
