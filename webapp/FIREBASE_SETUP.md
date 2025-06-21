# Firebase Authentication Setup for Sortyx

This guide will help you set up Firebase Authentication for the Sortyx waste classification webapp.

## Prerequisites

- A Google account
- Node.js and npm installed
- Basic knowledge of Firebase

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "sortyx-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch
   - Click "Save"

## Step 3: Enable Identity Toolkit API

1. Go to the [Google Cloud API Library](https://console.cloud.google.com/apis/library).
2. Make sure you have selected the correct Google Cloud project that corresponds to your Firebase project.
3. Search for "Identity Toolkit API".
4. Click on it and then click the "Enable" button. This is required for sign-up and sign-in functionality to work.

## Step 4: Set up Firestore Database

1. In the Firebase console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

## Step 5: Get Firebase Configuration

1. In the Firebase console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to the "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "sortyx-webapp")
6. Copy the Firebase configuration object

## Step 6: Update Firebase Configuration

1. Open `src/firebase/config.js`
2. Replace the demo configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 7: Set up Firebase Admin SDK (for Server)

1. In the Firebase console, go to Project Settings
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Open `server/firebase-admin.js`
6. Replace the demo service account with your actual service account data:

```javascript
const serviceAccount = require('./path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});
```

## Step 8: Set up Firestore Security Rules

1. In the Firebase console, go to Firestore Database
2. Click on the "Rules" tab
3. Update the rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rewards can be read by any authenticated user, but only created by an admin
    match /rewards/{rewardId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      // Deny updates and deletes for now for simplicity
      allow update, delete: if false;
    }
  }
}
```

## Step 9: Environment Variables (Optional but Recommended)

Create a `.env` file in the root directory:

```env
# Firebase Config
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Server Config
PORT=3001
NODE_ENV=development
```

Then update `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Step 10: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start the backend server:
   ```bash
   npm run server
   ```

3. Open your browser and navigate to the app
4. Try to sign up with a new account
5. Verify that the user data is stored in Firestore

## Features Implemented

### Authentication Features
- ✅ Email/Password sign up and sign in
- ✅ User profile management
- ✅ Password reset functionality
- ✅ Automatic logout
- ✅ Protected routes (server-side)

### User Data Management
- ✅ Points system with Firestore sync
- ✅ Environmental impact tracking
- ✅ User statistics
- ✅ Profile information display

### Security Features
- ✅ Firebase ID token verification
- ✅ User-specific data access
- ✅ Secure password handling
- ✅ Session management

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that your API key is correct in the Firebase config
   - Ensure the API key is not restricted to specific domains

2. **"Firebase: Error (auth/operation-not-allowed)"**
   - Make sure Email/Password authentication is enabled in Firebase Console

3. **"Firebase: Error (auth/network-request-failed)"**
   - Check your internet connection
   - Verify Firebase project is active

4. **"Firestore: Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Ensure the user is authenticated

### Development Tips

1. **Enable Firebase Emulator** for local development:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init emulators
   firebase emulators:start
   ```

2. **Monitor Authentication** in Firebase Console:
   - Go to Authentication > Users to see registered users
   - Check Authentication > Sign-in method for enabled providers

3. **Monitor Firestore** in Firebase Console:
   - Go to Firestore Database to see user data
   - Check the Rules tab for security configuration

## Production Deployment

Before deploying to production:

1. **Update Firestore Rules** to be more restrictive
2. **Enable additional authentication methods** if needed (Google, Facebook, etc.)
3. **Set up proper domain restrictions** for API keys
4. **Configure Firebase Hosting** for the frontend
5. **Set up Firebase Functions** for server-side operations
6. **Enable Firebase Analytics** for user insights

## Additional Features to Consider

- Google Sign-in integration
- Social media authentication
- Email verification
- Phone number verification
- Multi-factor authentication
- User roles and permissions
- Admin dashboard
- User activity logging

## Adding Initial Rewards

Since the rewards are now fetched from Firestore, you'll need to add some initial rewards to the database.

1.  Go to your Firestore Database in the Firebase Console.
2.  Click "+ Start collection".
3.  Enter `rewards` as the Collection ID.
4.  Click "Next" and then "Auto-ID" for the Document ID.
5.  Add the fields for your first reward:
    *   `title` (string)
    *   `description` (string)
    *   `pointsCost` (number)
    *   `image` (string) - can be an emoji or a URL
    *   `createdAt` (timestamp) - you can set this to the current time
6.  Click "Save". Repeat for any other initial rewards. 