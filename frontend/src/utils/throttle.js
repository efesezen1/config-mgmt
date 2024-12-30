const throttle = (fn, delay) => {
   let lastCall = 0
   let timeoutId = null

   return (...args) => {
      const now = Date.now()

      // Clear any existing timeout
      if (timeoutId) {
         clearTimeout(timeoutId)
      }

      // If enough time has passed since last call, execute immediately
      if (now - lastCall >= delay) {
         fn.apply(null, args)
         lastCall = now
      } else {
         // Otherwise, set a timeout to execute after the delay
         timeoutId = setTimeout(() => {
            fn.apply(null, args)
            lastCall = Date.now()
         }, delay - (now - lastCall))
      }
   }
}

export { throttle }
