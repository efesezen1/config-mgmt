<template>
  <div>
    <Navbar/>
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
          <input v-model="newParameter.key" placeholder="New Parameter"/>
          <input v-model="newParameter.value" placeholder="Value"/>
          <input v-model="newParameter.description" placeholder="New Description"/>
          <button class="button-add" @click="addParameter">
            <i class="pi pi-plus"></i>
            ADD
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import Navbar from '../components/Navbar.vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

const editingRows = ref([])
const parameters = ref([
  {
    key: 'min_version',
    value: '1.4.4',
    description: 'Minimum required version of the app',
    createDate: '10/05/2021 01:58'
  },
  {
    key: 'latest_version',
    value: '1.4.7',
    description: 'Latest version of the app',
    createDate: '10/05/2021 01:58'
  },
  {
    key: 'pricing_tier',
    value: 't6',
    description: 'Pricing tier of the user',
    createDate: '07/07/2021 11:13'
  },
  {
    key: 'scroll',
    value: '5',
    description: 'Index of Scroll Paywall for free users.',
    createDate: '25/08/2021 10:22'
  },
  {
    key: 'scroll_limit',
    value: '13',
    description: 'Index of Scroll Limit Paywall for free users.',
    createDate: '25/08/2021 10:23'
  }
])

const newParameter = ref({
  key: '',
  value: '',
  description: ''
})

const deletingRows = ref({})

const onRowEditSave = (event) => {
  const {newData, index} = event;
  parameters.value[index] = newData;
}

const onRowDeleteInit = (slotProps) => {
  deletingRows.value[slotProps.index] = true
}

const onRowDeleteConfirm = (slotProps) => {
  deleteParameter(slotProps.data)
  deletingRows.value[slotProps.index] = false
}

const onRowDeleteCancel = (slotProps) => {
  deletingRows.value[slotProps.index] = false
}

const addParameter = () => {
  if (newParameter.value.key && newParameter.value.value && newParameter.value.description) {
    parameters.value.push({
      ...newParameter.value,
      createDate: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '')
    })
    newParameter.value = {key: '', value: '', description: ''}
  }
}

const deleteParameter = (param) => {
  parameters.value = parameters.value.filter(p => p.key !== param.key)
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
