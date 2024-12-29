import axios from 'axios'
import { getAuth } from 'firebase/auth'

// Create a custom axios instance
const $http = axios.create({
   baseURL: 'http://localhost:3000/api/v1',
})

// Add an interceptor to set the Authorization header
$http.interceptors.request.use(
   async (config) => {
      try {
         const auth = getAuth()
         if (auth.currentUser) {
            // Get a fresh token before each request
            const token = await auth.currentUser.getIdToken(true)
             
            localStorage.setItem('customToken', token)
            config.headers.Authorization = `Bearer ${token}`
         }
         return config
      } catch (error) {
         console.error('Error getting fresh token:', error)
         return Promise.reject(error)
      }
   },
   (error) => {
      return Promise.reject(error)
   }
)

// Add a response interceptor to handle errors consistently
$http.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response) {
         // The request was made and the server responded with a status code
         // that falls out of the range of 2xx
         console.error('Response error:', error.response.data)
      } else if (error.request) {
         // The request was made but no response was received
         console.error('Request error:', error.request)
      } else {
         // Something happened in setting up the request that triggered an Error
         console.error('Error:', error.message)
      }
      return Promise.reject(error)
   }
)

export default $http
