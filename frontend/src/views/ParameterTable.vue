<template>
   <div class="p-5">
      <div class="table-container">
         <table class="w-full">
            <thead>
               <tr>
                  <th
                     v-for="col in columns"
                     :key="col.field"
                     class="text-left p-3 border-b border-slate-700"
                     :class="{ 'cursor-pointer': col.field === 'createdAt' }"
                     @click="col.field === 'createdAt' && toggleSort()"
                  >
                     {{ col.header }}
                     <span v-if="col.field === 'createdAt'" class="ml-1">
                        <i v-if="sortOrder === 'asc'" class="pi pi-sort-up"></i>
                        <i v-else-if="sortOrder === 'desc'" class="pi pi-sort-down"></i>
                        <i v-else="sortOrder === 'desc'" class="pi pi-sort"></i>
                     </span>
                  </th>
                  <th class="text-left p-3 border-b border-slate-700">
                     Actions
                  </th>
               </tr>
            </thead>
            <tbody>
               <tr
                  v-for="parameter in displayedParameters"
                  :key="parameter.id"
                  class="hover:bg-slate-800"
               >
                  <td
                     v-for="col in columns"
                     :key="col.field"
                     class="p-3 border-b border-slate-700"
                  >
                     {{ parameter[col.field] }}
                  </td>
                  <td class="p-3 border-b border-slate-700">
                     <div class="flex gap-2">
                        <Button
                           icon="pi pi-pencil"
                           severity="info"
                           rounded
                           size="small"
                           @click="onEdit(parameter)"
                           :disabled="isParameterLocked(parameter)"
                        />
                        <Button
                           icon="pi pi-trash"
                           severity="danger"
                           rounded
                           size="small"
                           @click="onDelete(parameter)"
                           :disabled="isParameterLocked(parameter)"
                        />
                     </div>
                  </td>
               </tr>
               <tr v-if="parameters.length === 0">
                  <td
                     :colspan="columns.length + 1"
                     class="text-center p-3 border-b border-slate-700"
                  >
                     No items exist.
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
      <div class="mt-5 bg-[#1a1d2d] p-4 rounded-lg">
         <div class="flex gap-3 items-center">
            <input
               v-for="col in columns.filter((c) => c.editable)"
               :key="col.field"
               class="input-style rounded flex-1"
               v-model="newParameterModel[col.field]"
               :placeholder="col.header"
            />
            <Button
               label="Add"
               icon="pi pi-plus"
               size="large"
               @click="$emit('add', newParameterModel)"
            />
         </div>
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
   </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const props = defineProps({
   parameters: {
      type: Array,
      required: true,
   },
   columns: {
      type: Array,
      required: true,
   },
   isParameterLocked: {
      type: Function,
   },
})

const displayedParameters = computed(() => {
   if (sortOrder.value === 'regular') {
      return props.parameters
   }
   
   return [...props.parameters].sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortOrder.value === 'asc' 
         ? dateA - dateB 
         : dateB - dateA
   })
})

const showDrawer = ref(false)
const editingParameter = ref({
   id: '',
   key: '',
   value: '',
   description: '',
})
const isEditing = ref(false)
const showDeleteModal = ref(false)
const parameterToDelete = ref(null)

const newParameterModel = defineModel('newParameter', {
   default: {
      key: '',
      value: '',
      description: '',
   },
})

const sortOrder = ref('regular') // 'regular', 'asc', 'desc'

const toggleSort = () => {
   if (sortOrder.value === 'regular') {
      sortOrder.value = 'asc'
   } else if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
   } else {
      sortOrder.value = 'regular'
   }
}

const emit = defineEmits([
   'edit',
   'delete',
   'add',
   'edit-initialized',
   'edit-cancelled',
   'delete-initialized',
   'delete-cancelled',
])

watch(isEditing, (x) => {
   if (!x) {
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   }
})

watch(showDrawer, (visible) => {
   if (visible && !isEditing.value) {
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   } else if (!visible && isEditing.value) {
      emit('edit-cancelled', editingParameter.value)
      isEditing.value = false
      editingParameter.value = { id: '', key: '', value: '', description: '' }
   }
})

const startEditing = (parameter) => {
   isEditing.value = true
   editingParameter.value = { ...parameter }
   showDrawer.value = true
}

const onEdit = async (parameter) => {
   emit('edit-initialized', parameter)
}

const onDelete = (parameter) => {
   parameterToDelete.value = parameter
   emit('delete-initialized', parameter)
}

const startDeleting = () => {
   showDrawer.value = false
   showDeleteModal.value = true
}

const cancelDelete = () => {
   showDeleteModal.value = false
   emit('delete-cancelled', parameterToDelete.value)
   parameterToDelete.value = null
}

const confirmDelete = () => {
   emit('delete', parameterToDelete.value)
   showDeleteModal.value = false
   parameterToDelete.value = null
}

const handleSubmit = () => {
   if (isEditing.value) {
      emit('edit', editingParameter.value)
   } else {
      emit('add', editingParameter.value)
   }
   showDrawer.value = false
}

defineExpose({
   startEditing,
   startDeleting,
})
</script>

<style scoped>
.input-style {
   @apply bg-slate-800 border-none p-2;
}

.table-container {
   @apply bg-slate-900 rounded-lg overflow-hidden;
}

table {
   @apply w-full border-collapse;
}

th {
   @apply bg-slate-800 font-medium text-slate-300;
}

tr:hover {
   @apply bg-slate-800/50;
}

td,
th {
   @apply text-left p-3 border-b border-slate-700;
}
</style>
