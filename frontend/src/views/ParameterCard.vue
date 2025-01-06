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
                  v-for="btn in actionButtons"
                  :key="btn.action"
                  :icon="btn.icon"
                  :label="btn.label"
                  :severity="btn.severity"
                  @click="$emit('initialized', parameter, btn.action)"
                  class="w-full justify-center"
                  :disabled="isParameterLocked(parameter)"
                  :loading="loadingStates[`${parameter.id}-${btn.action}`]"
               />
            </div>
         </div>
         <div v-else class="text-center">No items exist.</div>
         <Button
            icon="pi pi-plus"
            @click="$emit('initialized', null, 'add')"
            rounded
            style="position: sticky; bottom: 2rem; right: 2rem"
            class="sticky bottom-4 right-4 !ml-auto"
         />
      </div>
   </div>
</template>

<script setup>
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
   actionButtons: {
      type: Array,
      required: true,
   },
})

const emit = defineEmits(['initialized'])
</script>
