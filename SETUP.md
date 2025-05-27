# Interview Management System Setup Guide (Firebase)

## Prerequisites
- Node.js 18+ installed
- A Firebase account and project

## 1. Clone and Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

## 2. Firebase Setup

### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

### Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click **Done**

### Set up Storage (for avatars)
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location as Firestore
5. Click **Done**

### Get Your Configuration
1. Go to **Project settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (</>)
4. Register your app with a nickname
5. Copy the configuration object

### Create Environment File
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values

\`\`\`bash
cp .env.example .env.local
\`\`\`

Example `.env.local`:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
\`\`\`

## 3. Firestore Security Rules (Optional for Production)

For production, update your Firestore rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own interviews
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
\`\`\`

## 4. Storage Security Rules (Optional for Production)

For production, update your Storage rules:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

## 5. Run the Application

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Features Available

### Authentication
- Sign up with email and password
- Sign in with existing account
- Password reset via email
- Automatic profile creation

### Dashboard
- View interview statistics
- See pending interviews
- Quick search functionality
- Add new interviews

### Interview Management
- Create, read, update, delete interviews
- Real-time updates with Firestore
- Filter by status and priority
- Search by company, position, or interviewer
- Priority levels: High, Medium, Low
- Status tracking: Pending, Passed, Failed, No Feedback

### Profile Management
- Edit personal information
- Upload avatar image to Firebase Storage
- Set professional title and employment status
- Change password via email reset

### Responsive Design
- Desktop: Sidebar navigation
- Mobile: Bottom navigation
- Dark/Light theme toggle

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Make sure `.env.local` is in the root directory
   - Restart the development server after adding variables
   - Check that variable names match exactly

2. **Firebase Connection Issues**
   - Verify your Firebase configuration is correct
   - Check that your Firebase project is active
   - Ensure Authentication and Firestore are enabled

3. **Permission Errors**
   - Make sure Firestore is in test mode for development
   - Check that Authentication is properly configured
   - Verify Storage rules allow uploads

4. **Real-time Updates Not Working**
   - Check browser console for Firestore errors
   - Ensure you have a stable internet connection
   - Verify Firestore rules allow read access

### Getting Help
- Check the browser console for error messages
- Review the Firebase console for any issues
- Ensure all Firebase services are properly enabled

## Production Deployment

When deploying to production:

1. Update Firestore security rules to be more restrictive
2. Update Storage security rules
3. Configure proper CORS settings if needed
4. Set up Firebase hosting or deploy to your preferred platform
5. Monitor usage and set up billing alerts
6. Enable Firebase Analytics for insights

## Firebase vs Supabase Comparison

### Advantages of Firebase:
- **Real-time updates** - Firestore provides instant data synchronization
- **Easier setup** - No SQL knowledge required
- **Built-in authentication** - Comprehensive auth system
- **Scalable storage** - Firebase Storage handles file uploads seamlessly
- **Google integration** - Works well with other Google services

### Key Differences:
- **Database**: Firestore (NoSQL) vs Supabase (PostgreSQL)
- **Real-time**: Built-in with Firestore vs requires setup with Supabase
- **Pricing**: Pay-as-you-go vs more predictable pricing
- **Learning curve**: Easier for beginners vs more familiar for SQL developers

## Next Steps

1. **Test the application** - Create an account and add some interviews
2. **Customize the design** - Modify colors, fonts, and layout to your preference
3. **Add more features** - Consider adding notes, reminders, or calendar integration
4. **Deploy to production** - Use Vercel, Netlify, or Firebase Hosting

## Support

If you encounter any issues:
1. Check the Firebase console for errors
2. Review the browser console for debugging information
3. Ensure all environment variables are correctly set
4. Verify Firebase services are enabled and configured properly

The Firebase implementation should be much more reliable than Supabase for this use case, with real-time updates and easier authentication setup.
\`\`\`

Now let's remove the old Supabase API routes since we're using Firebase directly:

```typescriptreact file="app/api/interviews/route.ts" isDeleted="true"
...deleted...
