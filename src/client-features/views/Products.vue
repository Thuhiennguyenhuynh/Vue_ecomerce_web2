<template>
  <div class="products container mx-auto py-12 px-6 flex gap-8">
    <aside class="filters w-64 p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-fit">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Filters</h3>
      <!-- Filter controls -->
    </aside>
    <main class="product-grid flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="product-card bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h4 class="font-medium text-gray-700">{{ product.name }}</h4>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const products = ref([])

onMounted(async () => {
  const response = await api.getProducts({})
  products.value = response.data
})
</script>

<style scoped>
.products { display: flex; gap: 2rem; }
.product-grid { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
</style>
