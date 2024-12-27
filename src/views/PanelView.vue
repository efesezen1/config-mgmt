<template>
  <div>
    <Navbar/>
    <component
        :is="currentComponent"
        :parameters="parameters"
        v-model:newParameter="newParameter"
        @edit="onRowEditSave"
        @delete="deleteParameter"
        @add="addParameter"
    />
  </div>
</template>

<script setup>
import {ref, watch, onMounted, onUnmounted, computed} from 'vue'
import throttle from "../utils/throttle.js";
import ParameterTable from './ParameterTable.vue'
import ParameterCard from './ParameterCard.vue'
import Navbar from '../components/Navbar.vue'

const BREAKPOINT_MD = 768 // Standard medium breakpoint

const screenWidth = ref(window.innerWidth)

const currentComponent = computed(() => {
  return screenWidth.value >= BREAKPOINT_MD ? ParameterTable : ParameterCard
})

const handleResize = throttle(() => {
  screenWidth.value = window.innerWidth
}, 200) // 200ms throttle delay


onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// // Watch screen width changes
// watch(screenWidth, (newWidth) => {
//   console.log('Screen width changed:', newWidth)
// })

const parameters = ref([
  {
    key: 'min_version',
    value: '1.4.4',
    description: 'Minimum required version of the app',
    createDate: '10/05/2021 01:58',
  },
  {
    key: 'latest_version',
    value: '1.4.7',
    description: 'Latest version of the app',
    createDate: '10/05/2021 01:58',
  },
  {
    key: 'pricing_tier',
    value: 't6',
    description: 'Pricing tier of the user',
    createDate: '07/07/2021 11:13',
  },
  {
    key: 'scroll',
    value: '5',
    description: 'Index of Scroll Paywall for free users.',
    createDate: '25/08/2021 10:22',
  },
  {
    key: 'scroll_limit',
    value: '13',
    description: 'Index of Scroll Limit Paywall for free users.',
    createDate: '25/08/2021 10:23',
  },
])

const newParameter = ref({
  key: '',
  value: '',
  description: '',
})

const onRowEditSave = (newData) => {
  const index = parameters.value.findIndex(
      (param) => param.key === newData.key
  )
  if (index !== -1) {
    parameters.value[index] = newData
  }
}

const deleteParameter = (param) => {
  const index = parameters.value.findIndex((p) => p.key === param.key)
  if (index !== -1) {
    parameters.value.splice(index, 1)
  }
}

const addParameter = () => {
  if (newParameter.value.key && newParameter.value.value) {
    const now = new Date()
    const createDate =
        now.toLocaleDateString() + ' ' + now.toLocaleTimeString().slice(0, 5)
    parameters.value.push({
      ...newParameter.value,
      createDate,
    })
    newParameter.value = {
      key: '',
      value: '',
      description: '',
    }
  }
}
</script>
