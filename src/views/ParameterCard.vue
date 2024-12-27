<template>
  <div class="">
    <div class="p-5 flex flex-col gap-4 pb-20">
      <div
          v-if="parameters.length > 0"
          v-for="parameter in parameters"
          :key="parameter.key"
          class="bg-[#1a1d2d] rounded-lg p-4 flex flex-col gap-4"
      >
        <div class="flex-1">
          <div class="mb-3">
            <span class="text-[#a9b7d0] text-sm">Parameter Key:</span>
            <span class="text-white text-base ml-2">{{
                parameter.key
              }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <span class="text-[#a9b7d0] text-sm">Value:</span>
              <span class="text-white text-base">{{
                  parameter.value
                }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[#a9b7d0] text-sm">Description:</span>
              <span class="text-white text-base">{{
                  parameter.description
                }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[#a9b7d0] text-sm">Create Date:</span>
              <span class="text-white text-base">{{
                  parameter.createDate
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
          />
          <Button
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
          @click="()=>{isEditing=false; showDrawer = true}"
      />
      <Drawer
          v-model:visible="showDrawer"
          position="right"
          class="!bg-slate-900 !w-4/5"
      >
        <div class="p-4">
          <div class="flex flex-col gap-3">
            <input
                v-model="editingParameter.key"
                placeholder="New Parameter"
                class="input-style rounded"
            />
            <input
                v-model="editingParameter.value"
                placeholder="Value"
                class="input-style rounded"
            />
            <input
                v-model="editingParameter.description"
                placeholder="New Description"
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
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const props = defineProps({
  parameters: {
    type: Array,
    required: true,
  },
})

const showDrawer = ref(false)
const editingParameter = ref({
  key: '',
  value: '',
  description: '',
})
const isEditing = ref(false)

const newParameterModel = defineModel('newParameter', {
  default: {
    key: '',
    value: '',
    description: '',
  },
})

const emit = defineEmits(['edit', 'delete', 'add'])

watch(isEditing, (x) => {
  if (!x) {
    editingParameter.value = {key: '', value: '', description: ''}
  }
})

watch(showDrawer, (visible) => {
  if (visible && !isEditing.value) {
    editingParameter.value = {key: '', value: '', description: ''}
  } else if (!visible) {
    isEditing.value = false
    editingParameter.value = {key: '', value: '', description: ''}
  }
})

const onEdit = (parameter) => {
  isEditing.value = true
  editingParameter.value = {...parameter}
  showDrawer.value = true
}

const onDelete = (parameter) => {
  emit('delete', parameter)
}

const handleSubmit = () => {
  if (isEditing.value) {
    emit('edit', {...editingParameter.value})
  } else {
    newParameterModel.value = {...editingParameter.value}
    emit('add')
  }
  showDrawer.value = false
  isEditing.value = false
  editingParameter.value = {key: '', value: '', description: ''}
}
</script>
