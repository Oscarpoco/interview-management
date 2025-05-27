# Interview Management System

A modern, full-stack interview tracking application built with Next.js 15, React 19, Firebase, and Tailwind CSS.

## ✨ Features

### 🔐 Authentication
- Secure user registration and login with Firebase Auth
- Password reset functionality via email
- Automatic profile creation
- Session management

### 📊 Dashboard
- Interview statistics overview
- Pending interviews display with real-time updates
- Quick search functionality
- Live data synchronization

### 📝 Interview Management
- Create, read, update, delete interviews
- Real-time updates across all devices
- Priority levels (High, Medium, Low)
- Status tracking (Pending, Passed, Failed, No Feedback)
- Advanced filtering and search
- Date-based organization

### 👤 Profile Management
- Editable user profiles
- Avatar upload to Firebase Storage
- Professional title and employment status
- Password reset via email

### 🎨 Modern UI/UX
- Glass morphism design effects
- Dark/Light theme support
- Fully responsive design
- Mobile-first approach with bottom navigation
- Smooth animations and transitions
- Real-time data synchronization

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: Tailwind CSS, Radix UI components
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase account and project

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd interview-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore database (test mode)
   - Enable Storage
   - Get your configuration from Project Settings

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Firebase credentials in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
interview-management-system/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Dashboard page
│   ├── interviews/               # Interviews page
│   ├── profile/                  # Profile page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── interviews/               # Interview management
│   ├── layout/                   # Layout components
│   ├── profile/                  # Profile components
│   └── ui/                       # Reusable UI components
├── contexts/                     # React contexts
│   ├── auth-context.tsx          # Firebase authentication context
│   └── theme-context.tsx         # Theme context
├── lib/                          # Utility libraries
│   ├── database.types.ts         # Database type definitions
│   ├── firebase.ts               # Firebase client configuration
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variables template
├── .env.local                    # Your environment variables
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
\`\`\`

## 🔥 Firebase Integration

### Authentication
- Email/password authentication
- Password reset via email
- Automatic user profile creation
- Session persistence

### Firestore Database
- Real-time data synchronization
- Automatic updates across devices
- NoSQL document-based storage
- Built-in security rules

### Storage
- Avatar image uploads
- Secure file storage
- Automatic URL generation
- Built-in CDN

## 🎨 Design System

### Colors
- Primary: Blue to Purple gradients
- Status colors: Green (success), Red (error), Yellow (warning), Blue (info)
- Glass morphism effects with backdrop blur

### Typography
- Inter font family
- Responsive text sizing
- Consistent spacing and hierarchy

### Components
- Built with Radix UI primitives
- Custom styled with Tailwind CSS
- Fully accessible and keyboard navigable

## 📱 Responsive Design

### Desktop (md+)
- Sidebar navigation
- Multi-column layouts
- Hover effects and transitions

### Mobile (< md)
- Bottom navigation bar
- Single-column layouts
- Touch-optimized interactions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)
- Strict mode enabled

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add Firebase environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Firebase Hosting

## 🔒 Security

### Firebase Security
- Authentication required for all operations
- Firestore security rules (for production)
- Storage security rules
- Environment variables for configuration

### Production Security Rules

**Firestore Rules:**
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
\`\`\`

**Storage Rules:**
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section in SETUP.md
2. Review the Firebase console for errors
3. Check the browser console for errors
4. Create an issue in the repository

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Lucide](https://lucide.dev/) for the beautiful icons

## 🔥 Why Firebase?

### Advantages over Supabase:
- **Real-time updates** - Built-in real-time synchronization
- **Easier setup** - No SQL knowledge required
- **Better authentication** - More robust auth system
- **Scalable storage** - Seamless file upload handling
- **Google ecosystem** - Integrates well with other Google services
- **Offline support** - Works offline with automatic sync
- **Better error handling** - More descriptive error messages

### Key Features:
- **Instant updates** - Changes appear immediately across all devices
- **Offline-first** - App works without internet connection
- **Automatic scaling** - Handles traffic spikes automatically
- **Built-in security** - Security rules protect your data
- **Real-time collaboration** - Multiple users can work simultaneously
\`\`\`

Let's also update the .env.example to remove Supabase references:

```plaintext file=".env.example"
# Firebase Configuration
# Copy this file to .env.local and fill in your actual values

# Your Firebase API Key
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...

# Your Firebase Auth Domain
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com

# Your Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Your Firebase Storage Bucket
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Your Firebase Messaging Sender ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789

# Your Firebase App ID
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional environment variables
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
