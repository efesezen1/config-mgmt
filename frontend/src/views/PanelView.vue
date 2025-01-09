<template>
  <div>
    <Navbar/>
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
        @initialized="onParameterInitialized"
        @add="addParameter"
        :columns="columns"
        :isParameterLocked="lockMng.isLocked"
        :loading-states="loadingStates"
        :is-processing="isProcessing"
        :action-buttons="actionButtons"
    />
  </div>
  <Drawer
      v-model:visible="showDrawer"
      position="right"
      class="!bg-slate-900 w-4/5 md:w-1/2 lg:w-1/3 xl:w-1/4"
  >
    <template #header>
         <span class="capitalize text-lg font-semibold">
            {{ isEditing ? 'Edit' : 'Add' }} Parameter
         </span>
    </template>
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
            :loading="isProcessing"
        />
      </div>
    </div>
    <template #footer>
      <LockStatus
          v-if="screenWidth >= BREAKPOINT_MD || isEditing"
          :is-locked="lockMng.isLocked(editingParameter)"
          :formatted-time="formattedTimeRemaining"
      />
    </template>
  </Drawer>
  <Dialog
      v-model:visible="showDeleteModal"
      header="Confirm Delete"
      :modal="true"
      class="bg-slate-900"
      :closable="false"
  >
    <div class="flex flex-col gap-4">
      <p>Are you sure you want to delete this parameter?</p>
      <div class="flex justify-between items-center">
        <LockStatus
            :is-locked="lockMng.isLocked(editingParameter)"
            :formatted-time="formattedTimeRemaining"
        />
        <div class="flex justify-end gap-2">
          <Button label="No" severity="secondary" @click="cancelDelete"/>
          <Button label="Yes" severity="danger" @click="confirmDelete"/>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed, watch} from 'vue'
import {throttle, generateUUID, localizedDate, LockManager} from '../utils'
import {
  ParameterCard,
  ParameterTable,
  Navbar,
  LockStatus,
} from '../components'
import {useToast} from 'primevue/usetoast'
import $http from '../api/axios'
import {collection, onSnapshot, query} from 'firebase/firestore'
import {db, auth} from '../config/firebase'

const initToast = (action, message) => {
  toast.add({
    severity: action,
    summary: action[0].toUpperCase() + action.slice(1),
    detail: message,
    life: 3000,
  })
}
const INITIAL_ITEM = {id: '', key: '', value: '', description: ''}
const showDeleteModal = ref(false)
const BREAKPOINT_MD = 768 // Standard medium breakpoint
let PARAMETERS_COLLECTION = 'parameters'
const screenWidth = ref(window.innerWidth)
const lockMng = new LockManager(initToast)
const currentComponent = computed(() => {
  return screenWidth.value < BREAKPOINT_MD ? ParameterCard : ParameterTable
}) // Dynamic component
const parameters = ref([]) // Parameters list rendered on the screen
const isLoading = ref(false)
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
  {field: 'value', header: 'Value', editable: true, inputHeader: 'Value'},
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

const actionButtons = ref([
  {
    action: 'edit',
    icon: 'pi pi-pencil',
    severity: 'info',
    label: 'Edit',
  },
  {
    action: 'delete',
    icon: 'pi pi-trash',
    severity: 'danger',
    label: 'Delete',
  },
])

const editingParameter = ref({
  ...INITIAL_ITEM,
})
const isEditing = ref(false)
const toast = useToast()
const loadingStates = ref({})
const isProcessing = ref(false)

watch(isEditing, (x) => {
  if (!x) {
    editingParameter.value = {...INITIAL_ITEM}
  }
})

watch(showDrawer, (visible) => {
  if (visible && !isEditing.value) {
    editingParameter.value = {...INITIAL_ITEM}
  } else if (!visible && isEditing.value) {
    lockMng.unlock(editingParameter.value, 'edit')
  }
  if (!visible) {
    timeRemaining.value = 0
    isEditing.value = false
    editingParameter.value = {...INITIAL_ITEM}
  }
})

const handleSubmit = async () => {
  try {
    isProcessing.value = true
    if (isEditing.value) {
      await saveEdit(editingParameter.value)
    } else {
      await addParameter(editingParameter.value)
    }
    showDrawer.value = false
  } catch (error) {
    initToast('error', error.message)
  } finally {
    isProcessing.value = false
  }
}
let unsubscribe = null

const formattedTimeRemaining = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(timeRemaining.value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const handleResize = throttle(() => {
  screenWidth.value = window.innerWidth
}, 200) // 200ms throttle delay

let lockCheckInterval = null

// . . . LOCK CHECK VARIABLES
const TWO_MINUTES = 2 * 60 * 1000
let CURRENT_TIME
const timeRemaining = ref(TWO_MINUTES)

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
        initToast('error', 'Failed to fetch parameters')
        isLoading.value = false
      }
  )
  // . . . RESIZE LISTENER
  window.addEventListener('resize', handleResize)
  // . . . LOCK CHECK
  lockCheckInterval = setInterval(checkLockExpiration, 1000) // Check every 1 seconds
})

onUnmounted(() => {
  if (lockCheckInterval) {
    clearInterval(lockCheckInterval)
  }
  if (unsubscribe) {
    unsubscribe()
  }
  window.removeEventListener('resize', handleResize)
})

// . . . LOCK OPERATION
const checkLockExpiration = () => {
  CURRENT_TIME = new Date().getTime()
  if (!parameters.value || parameters.value.length === 0) return

  parameters.value.forEach((parameter) => {
    if (
        parameter &&
        parameter.id &&
        parameter.lockedAt &&
        parameter.lockedBy === auth.currentUser?.uid
    ) {
      const lockedTime = parameter.lockedAt.toDate().getTime()
      const timeDiff = CURRENT_TIME - lockedTime

      timeRemaining.value = TWO_MINUTES - timeDiff

      if (timeDiff >= TWO_MINUTES) {
        // If time is up, unlock the parameter and close modals if this parameter was being edited
        lockMng.unlock(parameter).then(() => {
          if (editingParameter.value?.id === parameter.id) {
            showDrawer.value = false
            showDeleteModal.value = false
            editingParameter.value = null
          }
        })
      }
    }
  })
}

// . . .ACTION HANDLERS
const onParameterInitialized = async (parameter, action) => {
  try {
    if (action === 'add') {
      startAdding()
      return
    }
    if (parameter) {
      loadingStates.value[`${parameter.id}-${action}`] = true
    }
    await lockMng.lock(parameter, action)
    if (action === 'edit') {
      startEditing(parameter)
    }
    if (action === 'delete') {
      startDeleting(parameter)
    }
  } catch (error) {
    initToast('error', error.message)
  } finally {
    if (parameter) {
      loadingStates.value[`${parameter.id}-${action}`] = false
    }
  }
}

// . . . DATABASE OPERATIONS
// . . . EDIT
const saveEdit = async (editedParameter) => {
  try {
    await $http.put(`/parameters/${editedParameter.id}`, {
      key: editedParameter.key,
      value: editedParameter.value,
      description: editedParameter.description,
    })
    initToast('success', 'Parameter updated successfully')
  } catch (error) {
    console.error('Error updating parameter:', error)
    initToast('error', 'Failed to update parameter')
  }
}

// . . . DELETE
const deleteParameter = async (param) => {
  try {
    await $http.delete(`/parameters/${param.id}`)
    initToast('success', 'Parameter deleted successfully')
  } catch (error) {
    console.error('Error deleting parameter:', error)
    initToast('error', 'Failed to delete parameter')
  }
}

// . . . ADD
const addParameter = async (parameter) => {
  try {
    isProcessing.value = true
    if (!parameter.key || !parameter.value) {
      initToast('warn', 'Key and Value fields are required')
      return
    }

    await $http.post('/parameters', {
      key: parameter.key,
      value: parameter.value,
      description: parameter.description || '',
      id: generateUUID(),
    })

    editingParameter.value = {
      ...INITIAL_ITEM,
    }

    initToast('success', 'Parameter added successfully')
  } catch (error) {
    console.error('Error adding parameter:', error)
    initToast('error', 'Failed to add parameter')
  } finally {
    isProcessing.value = false
  }
}

// ... INITIALIZERS
const startEditing = (parameter) => {
  isEditing.value = true
  editingParameter.value = {...parameter}
  showDrawer.value = true
}
const startDeleting = (parameter) => {
  showDrawer.value = false
  showDeleteModal.value = true
  parameterToDelete.value = parameter
}
const startAdding = () => {
  isEditing.value = false
  editingParameter.value = {...INITIAL_ITEM}
  showDrawer.value = true
}

// . . . CONFIRMATION MECHANISMS
const cancelDelete = () => {
  showDeleteModal.value = false
  lockMng.unlock(parameterToDelete.value, 'delete')
  parameterToDelete.value = null
}

const confirmDelete = () => {
  deleteParameter(parameterToDelete.value)
  showDeleteModal.value = false
  parameterToDelete.value = null
}
</script>
