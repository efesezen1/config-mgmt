# Configuration Management System

A full-stack web application for managing version control configurations. This project consists of a Vue.js frontend and Node.js/Express backend, with Firebase integration for data storage and authentication.

## Demo URLs
Demo links are provided for both the frontend and backend of the application. You can use these links to explore and test the application's functionality.

Frontend URL: [Panel](https://cwconfigpanel.netlify.app/)
This is the main user interface where users can interact with the application.

User credentials are as following:
1. User 1
   Email: jane@doe.com
   Password: 123123
2. User 2
   Email: john@doe.com
   Password: 123123

Backend URL: [Backend](https://case-study01-79f64e6c9c33.herokuapp.com/)
This is the API endpoint where the server processes requests. Use tools like Postman or cURL to test these endpoints. 
To access the backend API, you'll need to authenticate using a JWT (JSON Web Token) from Firebase Authentication. Follow these steps to obtain the token and include it in your requests:

1. Obtain a JWT
Sign in to the frontend application: Use the login functionality provided in the frontend to authenticate with Firebase.

Retrieve the JWT: Once authenticated, Firebase will issue a JWT. You can retrieve it using Firebase's client SDK.

In JavaScript:

```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
auth.currentUser.getIdToken(/* forceRefresh */ true).then((token) => {
  console.log("JWT Token:", token);
}).catch((error) => {
  console.error("Error getting token:", error);
});
```
2. Include the JWT in Backend Requests
Add the JWT to the Authorization header of your backend API requests in the following format:
```makefile
Authorization: Bearer <JWT_TOKEN>
```

## Features

- User authentication with Firebase
- Real-time parameter updates using Firestore
- Parameter locking mechanism with automatic expiration
- Responsive design with card and table views
- Rate limiting for API endpoints
- CORS protection

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- Vite
- PrimeVue for UI components
- Firebase Authentication
- Axios for API calls
- TailwindCSS for styling

 ## 🏗 Project Structure

```
.
├── backend/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API routes
│   └── index.js            # Main server file
│
└── frontend/               # Vue.js frontend application
    ├── src/
    │   ├── api/           # API integration
    │   ├── views/         # Vue components
    │   └── router/        # Vue router configuration
    └── public/            # Static assets
```
## 🛠 Prerequisites

- Node.js 18.x
- Firebase account and project setup
- npm or yarn package manager

## ⚙️ Environment Variables

### Backend
Create a `.env` file in the backend directory:

```env
PORT=3000
```

You'll also need to set up `serviceAccountKey.json` for Firebase authentication. A template is provided in `serviceAccountKeyExample.json`.


### Backend
- Node.js with Express
- Firebase Admin SDK
- Firestore for database
- Express Rate Limit
- CORS middleware

## Prerequisites

1. Node.js (v14 or higher)
2. npm or yarn
3. Firebase account
4. Heroku account (for backend deployment)
5. Netlify account (for frontend deployment)

## Setup Instructions

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Generate a Service Account Key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the `backend` directory

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Fill in the Firebase configuration in `.env`:
   ```
   VITE_APP_FIREBASE_API_KEY=your_api_key
   VITE_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_APP_FIREBASE_PROJECT_ID=your_project_id
   VITE_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_APP_FIREBASE_APP_ID=your_app_id
   VITE_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_APP_API_URL=http://localhost:3000/api/v1
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

All API endpoints are prefixed with `/api/v1` and require authentication unless specified otherwise.

### Parameters
All parameter endpoints are rate limited.

- `POST /parameters`
  - Create a new parameter
  - Body: `{ "id": string, "key": string, "value": string, "description": string }`
  - Required fields: id, key, value

- `PUT /parameters/:id`
  - Update an existing parameter
  - Body: `{ "key": string, "value": string, "description": string }`
  - All fields are optional

- `DELETE /parameters/:id`
  - Delete a parameter
  - No body required

- `PUT /parameters/:id/lock`
  - Lock a parameter for editing
  - No body required
  - Returns 403 if already locked by another user

- `PUT /parameters/:id/unlock`
  - Unlock a parameter
  - No body required
  - Only the user who locked the parameter can unlock it

### Response Format
All endpoints return JSON responses with the following structure:
- Success: `{ "message": string }`
- Error: `{ "error": string }`

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests (Rate limit exceeded)
- 500: Internal Server Error

## 📸 Screenshots

### Sign In Page
![Sign In Page](/frontend/public/signin.jpeg)

### Desktop View
![Desktop View](/frontend/public/image.png)

### Mobile View
![Mobile View](/frontend/public/mobile.jpeg)

## Deployment Instructions

### Backend Deployment (Heroku)

1. Install Heroku CLI and login:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. Add Firebase service account key to Heroku:
   ```bash
   heroku config:set FIREBASE_SERVICE_ACCOUNT_KEY="$(cat serviceAccountKey.json)"
   ```

4. Deploy to Heroku:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. Verify the deployment:
   ```bash
   heroku open
   ```

### Frontend Deployment (Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Install Netlify CLI and login:
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

3. Initialize Netlify site:
   ```bash
   netlify init
   ```

4. Set up environment variables in Netlify:
   - Go to Site Settings > Build & Deploy > Environment
   - Add all variables from your `.env` file
   - Set `VITE_APP_API_URL` to your Heroku backend URL

5. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

## Testing

1. Open your deployed Netlify site
2. Sign in with your Firebase credentials
3. Try creating, editing, and deleting parameters
4. Test the locking mechanism by opening the site in two different browsers
5. Verify that real-time updates work across different clients

## Important Notes

- The parameter locking mechanism expires after 2 minutes
- Rate limiting is applied to all API endpoints
- CORS is configured to only allow requests from the Netlify domain and localhost
- Make sure to keep your Firebase service account key secure
- Never commit sensitive information to version control

## Troubleshooting

1. **CORS Issues**: Ensure the frontend URL is added to the CORS configuration in `backend/index.js`
2. **Authentication Errors**: Verify Firebase configuration in both frontend and backend
3. **Database Access**: Check Firebase rules and service account permissions
4. **Deployment Issues**: Verify environment variables are correctly set in Heroku and Netlify

## License

MIT