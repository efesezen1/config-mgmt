<template>
   <div>
      <Navbar />
      <div
         v-if="isLoading"
         class="flex justify-center items-center min-h-[200px]"
      >
         <div class=" h-8 w-8 border-blue-500">
            <i class="pi pi-spin pi-spinner"></i>
         </div>
      </div>
      <component
         v-else
         :is="currentComponent"
         :parameters="parameters"
         v-model:newParameter="newParameter"
         @edit="onRowEditSave"
         @delete="deleteParameter"
         @add="addParameter"
         :columns="columns"
      />
   </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import throttle from '../utils/throttle.js'
import { generateUUID } from '../utils/uuid.js'
import ParameterTable from './ParameterTable.vue'
import ParameterCard from './ParameterCard.vue'
import Navbar from '../components/Navbar.vue'
import $http from '../api/axios'

const BREAKPOINT_MD = 768 // Standard medium breakpoint

const screenWidth = ref(window.innerWidth)

const currentComponent = computed(() => {
   return screenWidth.value >= BREAKPOINT_MD ? ParameterTable : ParameterCard
})

const parameters = ref([])
const isLoading = ref(false)

const newParameter = ref({
   key: '',
   value: '',
   description: '',
})

const columns = [
   {
      field: 'key',
      header: 'Parameter Key',
      editable: true,
      inputHeader: 'New Parameter',
   },
   { field: 'value', header: 'Value', editable: true, inputHeader: 'Value' },
   {
      field: 'description',
      header: 'Description',
      editable: true,
      inputHeader: 'New Description',
   },
   {
      field: 'createDate',
      header: 'Create Date',
      sortable: true,
      editable: false,
   },
]

const handleResize = throttle(() => {
   screenWidth.value = window.innerWidth
}, 200) // 200ms throttle delay

onMounted(async () => {
   try {
      isLoading.value = true
      const response = await $http.get('/parameters')
      parameters.value = response.data.parameters
      console.log('Fetched parameters:', parameters.value)
   } catch (error) {
      console.error('Error fetching parameters:', error)
   } finally {
      isLoading.value = false
   }
   window.addEventListener('resize', handleResize)
})

// Cleanup
onUnmounted(() => {
   window.removeEventListener('resize', handleResize)
})

const onRowEditSave = async (editedParameter) => {
   try {
      const index = parameters.value.findIndex(
         (param) => param.id === editedParameter.id
      )
      if (index !== -1) {
         await $http.put(`/parameters/${editedParameter.id}`, {
            key: editedParameter.key,
            value: editedParameter.value,
            description: editedParameter.description
         })
         parameters.value[index] = editedParameter
      }
   } catch (error) {
      console.error('Error updating parameter:', error)
   }
}

const deleteParameter = async (param) => {
   try {
      await $http.delete(`/parameters/${param.id}`)
      parameters.value = parameters.value.filter((p) => p.id !== param.id)
   } catch (error) {
      console.error('Error deleting parameter:', error)
   }
}

const addParameter = async () => {
   try {
      if (!newParameter.value.key || !newParameter.value.value) {
         console.error('Key and value are required')
         return
      }

      const parameterData = {
         id: generateUUID(),
         ...newParameter.value,
         createDate: new Date().toISOString()
      }

      await $http.post('/parameters', parameterData)
      parameters.value.push(parameterData)
      
      // Reset the form
      newParameter.value = {
         key: '',
         value: '',
         description: ''
      }
   } catch (error) {
      console.error('Error adding parameter:', error)
   }
}
</script>
