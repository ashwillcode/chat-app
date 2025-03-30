# Chat App

A real-time chat application built with Expo, React Native, and Firebase.

## Features

- Anonymous user authentication via Firebase
- Real-time messaging with Firestore
- User customization with name and background color selection
- Message timestamps and delivery status
- Modern, clean UI design
- Image sharing capabilities
- Message reactions
- Pull-to-refresh functionality

## Implementation Note

This app uses a custom chat implementation instead of the popular `react-native-gifted-chat` library. This decision was made to:
- Maintain full control over the UI/UX
- Avoid compatibility issues with newer React Native versions
- Implement custom features like message reactions and typing indicators
- Provide better performance with direct Firestore integration
- Enable easier customization of message bubbles and animations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account and project
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Anonymous Authentication in Firebase Authentication
   - Create a Firestore database
   - Create a `.env` file in the root directory with your Firebase configuration:
     ```
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_auth_domain
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_storage_bucket
     FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     FIREBASE_APP_ID=your_app_id
     ```
   - Never commit the `.env` file to version control

4. Start the development server:
```bash
npx expo start
```

## Project Structure

```
chat-app/
├── App.js                 # Main application component with Firebase and navigation setup
├── components/           
│   ├── Start.js          # Welcome screen with user authentication
│   └── Chat.js           # Real-time chat interface with Firestore integration
├── assets/               # Images and other static assets
└── package.json          # Project dependencies and scripts
```

## Firebase Integration

### Authentication
- Anonymous authentication using Firebase Auth
- User ID and display name management
- Clean session handling

### Firestore Database
- Real-time message synchronization
- Message structure:
  ```javascript
  {
    text: string,
    createdAt: timestamp,
    user: {
      _id: string,
      name: string,
      avatar: string | null
    },
    status: string,
    image?: string,
    reactions?: Array
  }
  ```

## Features Implementation

### Start Screen (`Start.js`)
- User name input
- Background color selection
- Anonymous authentication
- Navigation to chat with user context

### Chat Screen (`Chat.js`)
- Real-time message updates using Firestore listeners
- Message sending with proper timestamps
- Image sharing functionality
- Message reactions
- Typing indicators
- Pull-to-refresh capability
- Clean listener cleanup on unmount

## Development

### Adding New Features

1. Create new components in the `components/` directory
2. Update navigation in `App.js` if adding new screens
3. Follow the existing component structure and styling patterns
4. Ensure proper Firebase security rules are in place

### Firebase Security Rules

Basic security rules for Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Dependencies

- expo
- react-native
- @react-navigation/native
- @react-navigation/native-stack
- firebase (v10.3.1)
- expo-image-picker
- react-native-safe-area-context
- react-native-screens