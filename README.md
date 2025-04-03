# Chat App

A real-time chat application built with Expo, React Native, and Firebase.

## Features

- Persistent anonymous authentication (maintains user identity between sessions)
- Real-time messaging with Firestore
- Offline message caching and synchronization
- User customization:
  - Custom display name
  - Background color selection
  - Persistent user preferences
- Message features:
  - Text messages with timestamps
  - Image sharing (camera and gallery) (Note: Currently images are not persistently stored)
  - Location sharing
  - Message reactions (👍, ❤️, 😂, 😮, 😢, 😡)
  - Message status indicators
  - Copy message text
  - Auto-replies from chatbot
- Modern UI features:
  - Pull-to-refresh functionality
  - Typing indicators
  - Date headers (Today/Yesterday/Date)
  - Online/Offline status indication
  - Keyboard handling
  - Message bubble styling
- Cross-platform support (iOS and Android)

## Implementation Note

This app uses a custom chat implementation with:
- Direct Firestore integration for real-time messaging
- Local image handling (Firebase Storage integration pending)
- AsyncStorage for local data persistence
- Custom message bubble UI with reactions
- Optimized performance with FlatList
- Proper keyboard handling across platforms

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
   - Enable Firebase Storage
   - Create a `.env` file in the root directory with your Firebase configuration:
     ```
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_auth_domain
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_storage_bucket
     FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
```bash
npx expo start
```

## Usage Guide

### Getting Started
1. Launch the app
2. On the Start screen:
   - Enter your name in the text field
   - Select a background color from the four color options
   - Tap "Start Chatting" to enter the chat

### Basic Chat Functions
1. **Sending Messages**:
   - Type your message in the bottom input field
   - Tap the send button (arrow icon) to send
   - Your messages appear on the right in green
   - Other users' messages appear on the left in white
   - Chatbot will automatically reply to your messages

2. **Sharing Media**:
   - Tap the plus (+) icon beside the input field
   - Choose from:
     - "Choose From Library" - send existing photos
     - "Take Picture" - capture and send new photos
     - "Share Location" - send your current location

3. **Message Interactions**:
   - Long press any message to:
     - Add reactions (👍, ❤️, 😂, 😮, 😢, 😡)
     - Copy message text
   - Tap on shared locations to view in map

### Additional Features
- **Offline Mode**:
  - Continue using the app without internet
  - Messages are saved locally
  - "Offline Mode" indicator appears when disconnected
  - Messages sync automatically when connection returns

- **Navigation**:
  - Pull down to refresh message list
  - Messages auto-scroll to bottom when sending
  - Date headers show Today/Yesterday/Date
  - Typing indicators show when others are typing

- **Message Status**:
  - Check mark shows successful message delivery
  - Timestamps show in 12-hour format
  - Your name and preferences persist between sessions

## Project Structure

```
chat-app/
├── App.js                 # Main application component with Firebase setup
├── components/           
│   ├── Start.js          # Welcome screen with auth and preferences
│   ├── Chat.js           # Main chat interface
│   ├── CustomActions.js   # Custom action buttons (image/location)
│   └── CustomMapView.js   # Map view for location messages
├── assets/               # Static assets
└── package.json          # Project dependencies
```

## Key Components

### Start Screen (`Start.js`)
- Handles user authentication
- Manages user preferences
- Persists user data with AsyncStorage
- Provides color theme selection

### Chat Screen (`Chat.js`)
- Real-time message synchronization
- Message rendering and styling
- Offline support
- Image and location sharing
- Message reactions
- Typing indicators
- Auto-scroll behavior
- Chatbot auto-replies

### Custom Actions (`CustomActions.js`)
- Image picker integration (local only)
- Camera access (local only)
- Location sharing
- Firebase Storage upload handling

## Data Structure

### Messages in Firestore
```javascript
{
  text: string,          // Message content
  createdAt: timestamp,  // Server timestamp
  user: {
    _id: string,        // User identifier
    name: string,       // Display name
    avatar: string      // Optional avatar URL
  },
  location?: {          // Optional location data
    latitude: number,
    longitude: number
  },
  status: string,       // Message status (sent/delivered/read)
  reactions?: Array     // Optional message reactions
}
```

### Local Storage
- userId: Persistent anonymous user ID
- userName: User's display name
- backgroundColor: Selected chat background color
- messages: Cached messages for offline access

## Firebase Security Rules

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

## Dependencies

Key packages used:
- expo: ~52.0.42
- firebase: ^10.3.1
- @react-navigation/native: ^7.0.18
- @react-native-async-storage/async-storage: ^1.23.1
- expo-image-picker: ~16.0.6
- expo-location: ^18.0.10
- react-native-maps: ^1.20.1
- @expo/react-native-action-sheet: ^4.1.1

See package.json for complete list of dependencies.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Known Limitations

- Image sharing is currently implemented for local session only. Images are not persistently stored and will not be available after leaving the chat.
- Firebase Storage integration is prepared in the codebase but not currently functional.