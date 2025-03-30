import React, { useState, useEffect } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { Chat as ChatUI, defaultTheme } from 'react-native-chatty';

const Chat = () => {
    // Initialize the messages state
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Set the initial messages when the component mounts
        setMessages([
            // System message stating user has entered the chat
            {
                id: 1,
                text: 'Welcome! You have entered the chat',
                createdAt: new Date(),
                system: true,
            },
            // Example user message
            {
                id: 2,
                text: 'Hello! This is a sample message',
                createdAt: new Date(),
                user: {
                    id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            },
        ]);
    }, []);

    // Handler for sending messages
    const handleSendMessage = (message) => {
        setMessages((previousMessages) => [
            {
                id: Math.random().toString(),
                text: message.text,
                createdAt: new Date(),
                user: {
                    id: 1,
                    name: 'User',
                },
            },
            ...previousMessages,
        ]);
    };

    return (
        <View style={{ flex: 1 }}>
            {/* KeyboardAvoidingView to handle keyboard behavior on different devices */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 90}
            >
                {/* ChatUI component with required props */}
                <ChatUI
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    user={{ id: 1 }}
                    theme={defaultTheme}
                    showUserNames={true}
                    showUserAvatars={true}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

export default Chat; 