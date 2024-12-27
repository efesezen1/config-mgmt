<template>
   <div class="table-container p-5">
      <DataTable
         v-if="parameters.length > 0"
         :value="parameters"
         v-model:editingRows="editingRows"
         dataKey="id"
         editMode="row"
         @row-edit-save="onRowEditSave"
         removableSort
      >
         <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :sortable="col.sortable"
         >
            <template #editor="{ data, field }" v-if="col.editable">
               <InputText v-model="data[field]" class="p-inputtext-sm" />
            </template>
         </Column>
         <Column :rowEditor="true">
            <template #roweditoriniticon>
               <Button icon="pi pi-pencil" severity="info" />
            </template>
         </Column>
         <Column style="width: 5rem" bodyStyle="text-align:center">
            <template #body="slotProps">
               <div v-if="!deletingRows[slotProps.index]">
                  <Button
                     @click="onRowDeleteInit(slotProps)"
                     icon="pi pi-trash"
                     rounded
                     severity="danger"
                  />
               </div>
               <div v-else>
                  <Button
                     icon="pi pi-check"
                     rounded
                     severity="secondary"
                     variant="text"
                     @click="onRowDeleteConfirm(slotProps)"
                  />
                  <Button
                     icon="pi pi-times"
                     rounded
                     severity="secondary"
                     variant="text"
                     @click="onRowDeleteCancel(slotProps)"
                  />
               </div>
            </template>
         </Column>
      </DataTable>
      <div v-else class="text-center">No items exist.</div>
      <div class="mt-5 bg-[#1a1d2d] p-4 rounded-lg">
         <div class="flex gap-3 items-center">
            <input
               v-for="col in columns.filter(c => c.editable)"
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
   </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
   parameters: {
      type: Array,
      required: true,
   },
   columns: {
      type: Array,
      required: true,
   },
})

const newParameterModel = defineModel('newParameter', {
   default: () => ({}),
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
.table-container :deep(tr th) {
   background: transparent;
}

.table-container :deep(tr) {
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
</style>
