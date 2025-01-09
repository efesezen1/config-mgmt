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
                        <i
                            v-else-if="sortOrder === 'desc'"
                            class="pi pi-sort-down"
                        ></i>
                        <i v-else class="pi pi-sort"></i>
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
                  v-for="btn in actionButtons"
                  :key="btn.action"
                  :icon="btn.icon"
                  :severity="btn.severity"
                  rounded
                  size="small"
                  @click="$emit('initialized', parameter, btn.action)"
                  :disabled="isParameterLocked(parameter)"
                  :loading="loadingStates[`${parameter.id}-${btn.action}`]"
                  v-tooltip.bottom="btn.label"
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
            v-model="newParameter[col.field]"
            :placeholder="col.header"
        />
        <Button
            label="Add"
            icon="pi pi-plus"
            size="large"
            @click="()=>{$emit('add', newParameter);newParameter={...INITIAL_ITEM}}"
            :loading="isProcessing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'

const INITIAL_ITEM = {
  key: '',
  value: '',
  description: '',
}
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
  loadingStates: {
    type: Object,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  actionButtons: {
    type: Array,
    required: true,
  },
})
const newParameter = ref({
  ...INITIAL_ITEM
})

const sortOrder = ref('regular') // 'regular', 'asc', 'desc'
const displayedParameters = computed(() => {
  if (sortOrder.value === 'regular') {
    return props.parameters
  }

  return [...props.parameters].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
  })
})

const toggleSort = () => {
  if (sortOrder.value === 'regular') {
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else {
    sortOrder.value = 'regular'
  }
}

const emit = defineEmits(['initialized', 'add'])
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
