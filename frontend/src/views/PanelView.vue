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
         ref="componentRef"
         :parameters="parameters"
         v-model:newParameter="newParameter"
         @edit="onEditSave"
         @initialized="onParameterInitialized"
         @cancelled="unlockParameter"
         @delete="deleteParameter"
         @add="addParameter"
         :columns="columns"
         :isParameterLocked="isParameterLocked"
      />
   </div>
   <Drawer
      v-model:visible="showDrawer"
      position="right"
      class="!bg-slate-900 !w-4/5"
   >
      <div class="p-4">
         <div class="flex flex-col gap-3">
            <input
               v-for="col in columns.filter((c) => c.editable)"
               :key="col.field"
               v-model="editingParameter[col.field]"
               :placeholder="col.inputHeader"
               class="input-style rounded"
            />
            <Button
               :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
               :label="isEditing ? 'UPDATE' : 'ADD'"
               severity="warning"
               @click="handleSubmit"
               class="w-full justify-center"
            />
         </div>
      </div>
   </Drawer>
   <Dialog
      v-model:visible="showDeleteModal"
      header="Confirm Delete"
      :modal="true"
      class="!bg-slate-900"
   >
      <div class="flex flex-col gap-4">
         <p>Are you sure you want to delete this parameter?</p>
         <div class="flex justify-end gap-2">
            <Button label="No" severity="secondary" @click="cancelDelete" />
            <Button label="Yes" severity="danger" @click="confirmDelete" />
         </div>
      </div>
   </Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { throttle, generateUUID, localizedDate, getCurrentUser } from '../utils'
import ParameterTable from './ParameterTable.vue'
import ParameterCard from './ParameterCard.vue'
import Navbar from '../components/Navbar.vue'
import { useToast } from 'primevue/usetoast'
import $http from '../api/axios'
import { collection, onSnapshot, query, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { auth } from '../config/firebase'
const showDeleteModal = ref(false)
const BREAKPOINT_MD = 768 // Standard medium breakpoint
let PARAMETERS_COLLECTION = 'parameters'
const screenWidth = ref(window.innerWidth)
const currentComponent = computed(() => {
   return screenWidth.value >= BREAKPOINT_MD ? ParameterTable : ParameterCard
}) // Dynamic component
const parameters = ref([]) // Parameters list rendered on the screen
const isLoading = ref(false)
const newParameter = ref({
   key: '',
   value: '',
   description: '',
})
const parameterToDelete = ref(null)
const componentRef = ref(null)
const showDrawer = ref(false)
// . . . EDIT DATA VIEWS BY THESE PARAMETERS
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
      field: 'createdAt',
      header: 'Create Date',
      sortable: true,
      editable: false,
   },
]

const editingParameter = ref({
   id: '',
   key: '',
   value: '',
   description: '',
})
const isEditing = ref(false)
const toast = useToast()
watch(isEditing, (x) => {
   if (!x) {
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   }
})

watch(showDrawer, (visible) => {
   if (visible && !isEditing.value) {
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   } else if (!visible && isEditing.value) {
      unlockParameter(editingParameter.value, 'edit')
      isEditing.value = false
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   }
})

const startEditing = (parameter) => {
   isEditing.value = true
   editingParameter.value = { ...parameter }
   showDrawer.value = true
}

const handleSubmit = () => {
   if (isEditing.value) {
      onEditSave(editingParameter.value)
   } else {
      addParameter(editingParameter.value)
   }
   showDrawer.value = false
}
let unsubscribe = null

const handleResize = throttle(() => {
   screenWidth.value = window.innerWidth
}, 200) // 200ms throttle delay

// . . . INIT // REALTIME DATABASE LISTENER
onMounted(() => {
   isLoading.value = true
   const q = query(collection(db, PARAMETERS_COLLECTION))
   unsubscribe = onSnapshot(
      q,
      (snapshot) => {
         parameters.value = snapshot.docs.map((doc) => {
            return {
               id: doc.id,
               ...doc.data(),
               createdAt: localizedDate(doc.data().createdAt.toDate()),
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

const unlockParameter = async (parameter, action) => {
   try {
      await $http.put(`/parameters/${parameter.id}/unlock`)
      toast.add({
         severity: 'info',
         summary: 'Info',
         detail: action === 'edit' ? 'Edit cancelled' : 'Delete cancelled',
         life: 3000,
      })
   } catch (error) {
      console.error('Error unlocking parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to unlock parameter',
         life: 3000,
      })
   }
}

const lockParameter = async (parameter, action) => {
   try {
      await $http.put(`/parameters/${parameter.id}/lock`)
      toast.add({
         severity: 'success',
         summary: 'Success',
         detail:
            action === 'edit'
               ? 'Parameter locked successfully, you can edit now.'
               : 'Parameter locked successfully, confirm deletion.',
         life: 3000,
      })

      // If we're in card view and it's an edit action, start editing
      if (action === 'edit') {
         startEditing(parameter)
      }
      if (action === 'delete') {
         startDeleting(parameter)
      }
   } catch (error) {
      console.error('Error locking parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to lock parameter',
         life: 3000,
      })
      throw error // Re-throw to prevent editing in table view
   }
}

const onParameterInitialized = async (parameter, action) => {
   try {
      const lockResult = await lockParameter(parameter, action)
      if (!lockResult) {
         return
      }

      // If we're in card view and it's an edit action, start editing
      if (action === 'edit') {
         startEditing(parameter)
      }
      if (action === 'delete') {
         startDeleting(parameter)
      }
   } catch (error) {
      console.error('Error locking parameter:', error)
      toast.add({
         severity: 'error',
         summary: 'Error',
         detail: 'Failed to lock parameter',
         life: 3000,
      })
   }
}

const isParameterLocked = (parameter) => {
   if (!parameter || !parameter.isLocked) return false
   return parameter.isLocked && parameter.lockedBy !== auth.currentUser?.uid
}

// . . . DATABASE OPERATIONS
// . . . EDIT
const onEditSave = async (editedParameter) => {
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

// . . . DELETE
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

// . . . ADD
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
         id: generateUUID(),
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

const cancelDelete = () => {
   showDeleteModal.value = false
   unlockParameter(parameterToDelete.value, 'delete')
   parameterToDelete.value = null
}

const confirmDelete = () => {
   deleteParameter(parameterToDelete.value)
   showDeleteModal.value = false
   parameterToDelete.value = null
}
const startDeleting = (parameter) => {
   console.log(parameter)
   showDrawer.value = false
   showDeleteModal.value = true
   parameterToDelete.value = parameter
}
</script>
