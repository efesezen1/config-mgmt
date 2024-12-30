<template>
   <div>
      <Navbar />
      <div
         v-if="isLoading"
         class="flex justify-center items-center min-h-[200px]"
      >
         <div class="h-8 w-8 border-blue-500">
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
import { useToast } from 'primevue/usetoast'
import $http from '../api/axios'
import {
   collection,
   onSnapshot,
   query,
   doc,
} from 'firebase/firestore'
import { db } from '../config/firebase'

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

const toast = useToast()

let unsubscribe = null

const handleResize = throttle(() => {
   screenWidth.value = window.innerWidth
}, 200) // 200ms throttle delay

onMounted(() => {
   isLoading.value = true
   const q = query(collection(db, 'parameters'))
   unsubscribe = onSnapshot(
      q,
      (snapshot) => {
         parameters.value = snapshot.docs.map((doc) => {
            console.log(doc.data())
            return {
               id: doc.id,
               ...doc.data(),
            }
         })
         isLoading.value = false
      },
      (error) => {
         console.error('Error fetching parameters:', error)
         toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch parameters',
            life: 3000,
         })
         isLoading.value = false
      }
   )
   window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
   if (unsubscribe) {
      unsubscribe()
   }
   window.removeEventListener('resize', handleResize)
})

const onRowEditSave = async (editedParameter) => {
   try {
      await $http.put(`/parameters/${editedParameter.id}`, {
         key: editedParameter.key,
         value: editedParameter.value,
         description: editedParameter.description,
      })
      toast.add({
         severity: 'success',
         summary: 'Success',
         detail: 'Parameter updated successfully',
         life: 3000,
      })
   } catch (error) {
      console.error('Error updating parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to update parameter',
         life: 3000,
      })
   }
}

const deleteParameter = async (param) => {
   try {
      await $http.delete(`/parameters/${param.id}`)
      toast.add({
         severity: 'success',
         summary: 'Success',
         detail: 'Parameter deleted successfully',
         life: 3000,
      })
   } catch (error) {
      console.error('Error deleting parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to delete parameter',
         life: 3000,
      })
   }
}

const addParameter = async () => {
   try {
      if (!newParameter.value.key || !newParameter.value.value) {
         toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Key and Value fields are required',
            life: 3000,
         })
         return
      }

      await $http.post('/parameters', {
         key: newParameter.value.key,
         value: newParameter.value.value,
         description: newParameter.value.description || '',
      })

      // Reset form
      newParameter.value = {
         key: '',
         value: '',
         description: '',
      }

      toast.add({
         severity: 'success',
         summary: 'Success',
         detail: 'Parameter added successfully',
         life: 3000,
      })
   } catch (error) {
      console.error('Error adding parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to add parameter',
         life: 3000,
      })
   }
}
</script>
