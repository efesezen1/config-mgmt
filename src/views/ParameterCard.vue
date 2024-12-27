<template>
   <div class="p-5 flex flex-col gap-4">
      <div v-for="parameter in parameters" :key="parameter.key" class="bg-[#1a1d2d] rounded-lg p-4 flex justify-between items-start">
         <div class="flex-1">
            <div class="mb-3">
               <span class="text-[#a9b7d0] text-sm">Parameter Key:</span>
               <span class="text-white text-base ml-2">{{ parameter.key }}</span>
            </div>
            <div class="flex flex-col gap-2">
               <div class="flex flex-col gap-1">
                  <span class="text-[#a9b7d0] text-sm">Value:</span>
                  <span class="text-white text-base">{{ parameter.value }}</span>
               </div>
               <div class="flex flex-col gap-1">
                  <span class="text-[#a9b7d0] text-sm">Description:</span>
                  <span class="text-white text-base">{{ parameter.description }}</span>
               </div>
               <div class="flex flex-col gap-1">
                  <span class="text-[#a9b7d0] text-sm">Create Date:</span>
                  <span class="text-white text-base">{{ parameter.createDate }}</span>
               </div>
            </div>
         </div>
         <div class="flex gap-2">
            <Button icon="pi pi-pencil" label="Edit" severity="info" @click="onEdit(parameter)" />
            <Button icon="pi pi-trash" label="Delete" severity="danger" @click="onDelete(parameter)" />
         </div>
      </div>

      <div class="mt-5 bg-[#1a1d2d] p-4 rounded-lg">
         <div class="flex gap-3 items-center">
            <input 
               v-model="newParameterModel.key" 
               placeholder="New Parameter"
               class="flex-1 bg-[#13151f] border-none p-2 px-3 text-[#a9b7d0] rounded placeholder:text-[#4a5568]"
            />
            <input 
               v-model="newParameterModel.value" 
               placeholder="Value"
               class="flex-1 bg-[#13151f] border-none p-2 px-3 text-[#a9b7d0] rounded placeholder:text-[#4a5568]"
            />
            <input 
               v-model="newParameterModel.description" 
               placeholder="New Description"
               class="flex-1 bg-[#13151f] border-none p-2 px-3 text-[#a9b7d0] rounded placeholder:text-[#4a5568]"
            />
            <button 
               class="bg-[#06b6d4] text-white px-4 py-2 rounded flex items-center gap-1 whitespace-nowrap hover:opacity-90 transition-opacity"
               @click="$emit('add')"
            >
               <i class="pi pi-plus text-xs"></i>
               ADD
            </button>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
   parameters: {
      type: Array,
      required: true,
   },
})

const newParameterModel = ref({
   key: '',
   value: '',
   description: '',
})

const emit = defineEmits(['edit', 'delete', 'add'])

const onEdit = (parameter) => {
   emit('edit', { ...parameter })
}

const onDelete = (parameter) => {
   emit('delete', parameter)
}
</script>
