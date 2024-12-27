<template>
  <div class="table-container">
    <DataTable
      :value="parameters"
      v-model:editingRows="editingRows"
      dataKey="key"
      editMode="row"
      @row-edit-save="onRowEditSave"
      removableSort
    >
      <Column field="key" header="Parameter Key">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="p-inputtext-sm"/>
        </template>
      </Column>
      <Column field="value" header="Value">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="p-inputtext-sm"/>
        </template>
      </Column>
      <Column field="description" header="Description">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="p-inputtext-sm"/>
        </template>
      </Column>
      <Column field="createDate" header="Create Date" sortable></Column>
      <Column :rowEditor="true" style="width: 10%; min-width: 4rem" bodyStyle="text-align:center"></Column>
      <Column style="width: 5rem" bodyStyle="text-align:center">
        <template #body="slotProps">
          <div v-if="!deletingRows[slotProps.index]">
            <Button @click="onRowDeleteInit(slotProps)" icon="pi pi-trash" rounded severity="secondary"
                    variant="text"/>
          </div>
          <div v-else>
            <Button icon="pi pi-check" rounded severity="secondary"
                    variant="text" @click="onRowDeleteConfirm(slotProps)"/>
            <Button icon="pi pi-times" rounded severity="secondary"
                    variant="text" @click="onRowDeleteCancel(slotProps)"/>
          </div>
        </template>
      </Column>
    </DataTable>

    <div class="new-parameter-form">
      <div class="input-group">
        <input v-model="newParameterModel.key" placeholder="New Parameter"/>
        <input v-model="newParameterModel.value" placeholder="Value"/>
        <input v-model="newParameterModel.description" placeholder="New Description"/>
        <button class="button-add" @click="$emit('add', newParameterModel)">
          <i class="pi pi-plus"></i>
          ADD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const props = defineProps({
  parameters: {
    type: Array,
    required: true
  }
})

const newParameterModel = defineModel('newParameter', {
  default: {
    key: '',
    value: '',
    description: ''
  }
})

const emit = defineEmits(['edit', 'delete', 'add'])

const editingRows = ref([])
const deletingRows = ref({})

const onRowEditSave = (event) => {
  emit('edit', event.newData)
}

const onRowDeleteInit = (slotProps) => {
  deletingRows.value[slotProps.index] = true
}

const onRowDeleteConfirm = (slotProps) => {
  emit('delete', slotProps.data)
  deletingRows.value[slotProps.index] = false
}

const onRowDeleteCancel = (slotProps) => {
  deletingRows.value[slotProps.index] = false
}
</script>

<style scoped>
.table-container {
  padding: 20px;
}

.table-container :deep(tr th) {
  background: transparent;
}

.table-container :deep( tr) {
  background: transparent;
}

.table-container :deep(.p-datatable .p-datatable-tbody tr td) {
  border-color: #2a2d3d;
}

.table-container :deep(.p-datatable .p-datatable-tbody tr td .p-inputtext) {
  width: 100%;
  background-color: #13151f;
  border: 1px solid #2a2d3d;
  padding: 6px 12px;
  color: #a9b7d0;
  border-radius: 4px;
}

.new-parameter-form {
  margin-top: 20px;
  background-color: #1a1d2d;
  padding: 16px;
  border-radius: 8px;
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

input {
  background-color: #13151f;
  border: none;
  padding: 8px 12px;
  color: #a9b7d0;
  border-radius: 4px;
  flex: 1;
}

input::placeholder {
  color: #4a5568;
}

.button-add {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #06b6d4;
  color: white;
  white-space: nowrap;
}

.button-add i {
  font-size: 12px;
}

.button-add:hover {
  opacity: 0.9;
}
</style>
