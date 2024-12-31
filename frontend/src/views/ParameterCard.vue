<template>
   <div class="">
      <div class="p-5 flex flex-col gap-4 pb-20">
         <div
            v-if="parameters.length > 0"
            v-for="parameter in parameters"
            :key="parameter.id"
            class="bg-[#1a1d2d] rounded-lg p-4 flex flex-col gap-4 relative"
         >
            <div
               class="absolute top-5 right-5"
               v-show="isParameterLocked(parameter)"
            >
               <i class="pi pi-lock"></i>
            </div>

            <div class="flex-1">
               <div class="flex flex-col gap-2">
                  <div
                     v-for="col in columns"
                     :key="col.field"
                     class="flex flex-col gap-1"
                  >
                     <span class="text-[#a9b7d0] text-sm"
                        >{{ col.header }}:</span
                     >
                     <span class="text-white text-base">{{
                        parameter[col.field]
                     }}</span>
                  </div>
               </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
               <Button
                  icon="pi pi-pencil"
                  label="Edit"
                  severity="info"
                  @click="onEdit(parameter)"
                  class="w-full justify-center"
                  :disabled="isParameterLocked(parameter)"
               />
               <Button
                  :disabled="isParameterLocked(parameter)"
                  icon="pi pi-trash"
                  label="Delete"
                  severity="danger"
                  @click="onDelete(parameter)"
                  class="w-full justify-center"
               />
            </div>
         </div>
         <div v-else class="text-center">No items exist.</div>
         <Button
            icon="pi pi-plus"
            severity=""
            rounded
            style="position: sticky; bottom: 2rem; right: 2rem"
            class="sticky bottom-4 right-4 !ml-auto"
            @click="
               () => {
                  isEditing = false
                  showDrawer = true
               }
            "
         />
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
                  <Button
                     label="No"
                     severity="secondary"
                     @click="cancelDelete"
                  />
                  <Button
                     label="Yes"
                     severity="danger"
                     @click="confirmDelete"
                  />
               </div>
            </div>
         </Dialog>
      </div>
   </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'

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
   emit('delete-cancelled', parameterToDelete.value)
   showDeleteModal.value = false
   parameterToDelete.value = null
}

const confirmDelete = () => {
   emit('delete', parameterToDelete.value)
   showDeleteModal.value = false
   parameterToDelete.value = null
}

const handleSubmit = () => {
   if (isEditing.value) {
      emit('edit', { ...editingParameter.value })
   } else {
      newParameterModel.value = { ...editingParameter.value }
      emit('add')
   }
   showDrawer.value = false
   isEditing.value = false
   editingParameter.value = { id: '', key: '', value: '', description: '' }
}

defineExpose({
   startEditing,
   startDeleting,
})
</script>
