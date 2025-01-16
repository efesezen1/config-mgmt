<template>
   <svg
      viewBox="-12 -12 72.00 72.00"
      data-name="Layer 1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
   >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
         id="SVGRepo_tracerCarrier"
         stroke-linecap="round"
         stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
         <title></title>
         <g>
            <path
               class="cls-1"
               d="M43.00222,10.65235,42.99855,45.348A1.65217,1.65217,0,0,1,41.34638,47H16.56359a1.65217,1.65217,0,0,1-1.65217-1.65217V18.087L24.00039,9H41.35A1.65217,1.65217,0,0,1,43.00222,10.65235Z"
            ></path>
            <polyline
               class="cls-1"
               points="18.392 18.913 24.107 18.913 24 9"
            ></polyline>
            <g>
               <circle class="cls-2" cx="29" cy="31.20477" r="3"></circle>
               <path
                  class="cls-1"
                  d="M30.32853,41l.77641-2.18331,1.93387-.801,2.09284.99482,1.87882-1.87882-.99482-2.09284.801-1.93387L39,32.32853V29.67147l-2.18331-.77641-.801-1.93387.99482-2.09284-1.87882-1.87882-2.09284.99482-1.93387-.801L30.32853,21H27.67147l-.77641,2.18331-1.93387.801-2.09284-.99482-1.87882,1.87882.99482,2.09284-.801,1.93387L19,29.67147v2.65706l2.18331.77641.801,1.93387-.99482,2.09284,1.87882,1.87882,2.09284-.99482,1.93387.801L27.625,41Z"
               ></path>
            </g>
            <path
               class="cls-1"
               d="M14.875,43H11.56359a1.65217,1.65217,0,0,1-1.65217-1.65217V14.087L19.00039,5H36.35a1.65217,1.65217,0,0,1,1.65217,1.65235L37.99855,9"
            ></path>
            <path
               class="cls-1"
               d="M9.75,39H6.56359a1.65217,1.65217,0,0,1-1.65217-1.65217V10.087L14.00039,1H31.35a1.65217,1.65217,0,0,1,1.65217,1.65235L32.99855,4.875"
            ></path>
         </g>
      </g>
   </svg>
</template>

<script setup>
defineProps({
   width: {
      type: String,
      default: '48px',
   },
   height: {
      type: String,
      default: '48px',
   },
})
</script>

<style scoped>
.cls-1,
.cls-2 {
   fill: none;
   stroke: white;
   stroke-width: 2px;
}
.cls-1 {
   stroke-linecap: round;
   stroke-linejoin: round;
}
.cls-2 {
   stroke-miterlimit: 10;
}
.logo {
   display: inline-block;
}

svg {
   width: v-bind(width);
   height: v-bind(height);
}
</style>
