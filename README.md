# Chat App

A real-time chat application built with Expo and React Native.

## Features

- User customization with name and background color selection
- Smooth navigation between screens
- Modern, clean UI design
- Real-time messaging capabilities (coming soon)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
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

3. Start the development server:
```bash
npx expo start
```

## Project Structure

```
chat-app/
├── App.js                 # Main application component with navigation setup
├── components/           
│   ├── Start.js          # Welcome screen with user setup
│   └── Chat.js           # Main chat interface
├── assets/               # Images and other static assets
└── package.json          # Project dependencies and scripts
```

## Navigation

The app uses React Navigation with a native stack navigator:

- **Start Screen**: Initial screen where users enter their name and select a background color
- **Chat Screen**: Main chat interface that displays the user's selected background color and name in the header

## Development

### Adding New Features

1. Create new components in the `components/` directory
2. Update navigation in `App.js` if adding new screens
3. Follow the existing component structure and styling patterns

### Styling Guidelines

- Use the provided color palette for consistency
- Follow the established component structure
- Maintain responsive design principles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.