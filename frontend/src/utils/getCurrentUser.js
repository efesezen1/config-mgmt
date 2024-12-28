import { onAuthStateChanged, getAuth } from 'firebase/auth'

const getCurrentUser = () => {
   return new Promise((resolve, reject) => {
      const removeListener = onAuthStateChanged(
         getAuth(),
         (user) => {
            removeListener()
            resolve(user)
         },
         reject
      )
   })
}

export { getCurrentUser }
