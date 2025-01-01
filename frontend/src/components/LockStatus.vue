<template>
   <span>
      <i
         :class="{
            'pi pi-lock': !isLocked,
            'pi pi-unlock': isLocked,
         }"
      ></i>
      {{ isLocked ? 'Unlocked' : 'Locked' }} -
      {{ formattedTime }}
   </span>
</template>

<script setup>
defineProps({
   isLocked: {
      type: Boolean,
      required: true
   },
   formattedTime: {
      type: String,
      required: true
   }
})
</script>
