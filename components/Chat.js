/**
 * Chat Screen Component
 * 
 * This component implements the main chat functionality:
 * 1. Real-time message synchronization with Firestore
 * 2. Message sending and receiving
 * 3. Image sharing capabilities
 * 4. Message reactions
 * 5. Typing indicators
 * 6. Pull-to-refresh functionality
 */

import { StyleSheet, View, Platform, KeyboardAvoidingView, FlatList, TextInput, TouchableOpacity, Text, Image, Pressable, Alert, Clipboard, ActivityIndicator, Modal, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Available reactions for messages
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

// Define auto-reply messages for the chatbot
const AUTO_REPLIES = [
  "That's interesting! Tell me more.",
  "I see what you mean!",
  "Thanks for sharing!",
  "How do you feel about that?",
  "Really? That's fascinating!",
  "I agree with you!",
];

/**
 * Chat Screen Component
 * @param {object} route - Contains route params including name, userID, and backgroundColor
 * @param {object} db - Firestore database instance
 * @param {boolean} isConnected - Indicates whether the device is connected to the internet
 * @returns {React.Component} A React component that renders the chat interface
 */
const Chat = ({ route, db, isConnected }) => {
  // Extract user information and preferences from route params
  const { backgroundColor, name: userName, userID } = route.params;
  
  // State management for chat functionality
  const [messages, setMessages] = useState([]); // Store chat messages
  const [inputText, setInputText] = useState(''); // Store input field text
  const [isTyping, setIsTyping] = useState(false); // Track typing indicator
  const [isRefreshing, setIsRefreshing] = useState(false); // Track pull-to-refresh
  const [showReactions, setShowReactions] = useState(null); // Track reaction picker visibility
  
  // Create user object for message attribution
  const user = {
    _id: userID,
    name: userName,
    avatar: null
  };

  // Animation refs for typing indicator
  const typingTimeoutRef = useRef(null);
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const flatListRef = useRef(null);

  // Load cached messages when offline
  useEffect(() => {
    const loadCachedMessages = async () => {
      try {
        const cachedMessages = await AsyncStorage.getItem('messages');
        if (cachedMessages) {
          setMessages(JSON.parse(cachedMessages));
        }
      } catch (error) {
        console.error('Error loading cached messages:', error);
      }
    };

    if (!isConnected) {
      loadCachedMessages();
    }
  }, [isConnected]);

  /**
   * Setup effect for initializing chat requirements
   * - Requests media permissions
   * - Sets up Firestore listener
   * Returns cleanup function for listeners
   */
  useEffect(() => {
    // Request media permissions
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to share images!');
      }
    };
    requestPermissions();

    // Set up Firestore listener when online
    let unsubscribe;
    
    if (isConnected) {
      const q = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'desc')
      );
      
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const newMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt ? new Date(data.createdAt.toMillis()) : new Date();
          
          return {
            _id: doc.id,
            text: data.text,
            createdAt,
            user: data.user,
            image: data.image,
            reactions: data.reactions || [],
            status: data.status || 'sent'
          };
        });

        // Save messages to AsyncStorage
        try {
          await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
        } catch (error) {
          console.error('Error caching messages:', error);
        }
        
        setMessages(newMessages);
        
        // Auto-scroll to latest message
        if (flatListRef.current && newMessages.length > 0) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      });
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [db, isConnected]);

  /**
   * Animation effect for typing indicator
   * Creates a loop animation sequence for three dots
   */
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          // Animate first dot
          Animated.sequence([
            Animated.timing(dot1Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Opacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          // Animate second dot
          Animated.sequence([
            Animated.timing(dot2Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          // Animate third dot
          Animated.sequence([
            Animated.timing(dot3Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [isTyping]);

  /**
   * Handle typing indicator timeout
   * Shows typing indicator while user is entering text
   * @param {string} text - The current input text
   */
  const handleTyping = (text) => {
    setInputText(text);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  /**
   * Handle image picking from gallery
   * Allows users to select and send images
   */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0].uri) {
      const newMessage = {
        _id: Date.now(),
        createdAt: new Date(),
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        image: result.assets[0].uri,
      };

      setMessages(previousMessages => [newMessage, ...previousMessages]);
    }
  };

  /**
   * Handle pull-to-refresh functionality
   * Simulates refresh with a delay
   */
  const onRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  /**
   * Add reaction to a message
   * @param {string} messageId - ID of the message to react to
   * @param {string} reaction - The reaction emoji to add
   */
  const addReaction = (messageId, reaction) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: [...(msg.reactions || []), { reaction, userId: user._id }]
            }
          : msg
      )
    );
    setShowReactions(null);
  };

  /**
   * Handle sending messages
   * Adds new message to Firestore with proper formatting
   */
  const onSend = async () => {
    if (!inputText.trim()) return;

    try {
      const newMessage = {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        status: 'sent'
      };

      if (isConnected) {
        // Add user message to Firestore when online
        await addDoc(collection(db, 'messages'), newMessage);
        
        // Generate chatbot response after a short delay
        setTimeout(async () => {
          const botMessage = {
            text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
            createdAt: serverTimestamp(),
            user: {
              _id: 'chatbot',
              name: 'Chat Bot',
              avatar: null
            },
            status: 'sent'
          };
          
          // Add bot message to Firestore
          await addDoc(collection(db, 'messages'), botMessage);
        }, 1000);
      } else {
        // Handle offline message
        const offlineMessage = {
          ...newMessage,
          _id: Date.now().toString(),
          createdAt: new Date(),
          status: 'pending'
        };

        const updatedMessages = [offlineMessage, ...messages];
        setMessages(updatedMessages);
        
        // Save to AsyncStorage
        try {
          await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
        } catch (error) {
          console.error('Error saving offline message:', error);
        }
      }
      
      setInputText('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Format date for message headers
  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Handle long press on messages
  const handleMessageLongPress = (message) => {
    Alert.alert(
      'Message Options',
      '',
      [
        {
          text: 'Copy',
          onPress: () => {
            Clipboard.setString(message.text);
            Alert.alert('Copied to clipboard');
          }
        },
        {
          text: 'React',
          onPress: () => setShowReactions(message._id)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Render user avatar
  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <View style={styles.defaultAvatar}>
        <FontAwesome name="user" size={24} color="#FFFFFF" />
      </View>
    </View>
  );

  // Render message status indicator
  const renderMessageStatus = (status, isUser) => {
    if (!isUser) return null;

    const statusConfig = {
      sent: { name: 'check', color: '#8E8E93' },
      delivered: { name: 'check-circle', color: '#007AFF' },
      read: { name: 'check-circle', color: '#4CD964' }
    };

    const config = statusConfig[status] || statusConfig.sent;

    return (
      <View style={styles.messageStatusContainer}>
        <FontAwesome name={config.name} size={12} color={config.color} />
      </View>
    );
  };

  // Render message reactions
  const renderReactions = (message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = message.reactions.reduce((acc, { reaction }) => {
      acc[reaction] = (acc[reaction] || 0) + 1;
      return acc;
    }, {});

    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(reactionCounts).map(([reaction, count]) => (
          <View key={reaction} style={styles.reactionBubble}>
            <Text>{reaction} {count}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render individual message
  const renderMessage = ({ item, index }) => {
    const isSystem = item.system;
    const isUser = !isSystem && item.user && item.user._id === user._id;
    const showDateHeader = index === messages.length - 1 || 
      formatDate(item.createdAt) !== formatDate(messages[index + 1]?.createdAt);

    if (isSystem) {
      return (
        <View>
          {showDateHeader && (
            <View style={styles.dateHeaderContainer}>
              <Text style={styles.dateHeaderText}>{formatDate(item.createdAt)}</Text>
            </View>
          )}
          <View style={styles.systemMessageContainer}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
          {!isUser && renderAvatar()}
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
            {!isUser && <Text style={styles.messageAuthor}>Chat Bot</Text>}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.messageImage} />
            ) : (
              <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.otherMessageText]}>
                {item.text}
              </Text>
            )}
            {renderReactions(item)}
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {renderMessageStatus(item.status, isUser)}
            </View>
          </View>
          {isUser && renderAvatar()}
        </View>
      </View>
    );
  };

  // Main render
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id.toString()}
          inverted={true}
          style={styles.messageList}
          contentContainerStyle={{ flexGrow: 1 }}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          }}
        />

        {/* Connection Status Indicator */}
        {!isConnected && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}

        {/* Typing Indicator */}
        {isTyping && isConnected && (
          <View style={[styles.typingContainer]}>
            <View style={styles.typingDotsWrapper}>
              <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
            </View>
          </View>
        )}

        {/* Input Section - Only show when online */}
        {isConnected && (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={pickImage}
            >
              <FontAwesome name="image" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={onSend}
              disabled={!inputText.trim()}
            >
              <FontAwesome 
                name="send" 
                size={24} 
                color={inputText.trim() ? "#007AFF" : "#666"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Reactions Modal */}
      <Modal
        visible={showReactions !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReactions(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactions(null)}
        >
          <View style={styles.reactionsModal}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity
                key={reaction}
                style={styles.reactionButton}
                onPress={() => addReaction(showReactions, reaction)}
              >
                <Text style={styles.reactionEmoji}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },

  // Message container styles
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },

  // System message styles
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Message bubble styles
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  userBubble: {
    backgroundColor: '#FFF9C4',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#E3F2FD',
    borderBottomLeftRadius: 5,
  },

  // Message text styles
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageAuthor: {
    fontSize: 12,
    color: '#424242',
    marginBottom: 4,
  },

  // Avatar styles
  avatarContainer: {
    width: 40,
    height: 40,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Input section styles
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  // Date header styles
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
  dateHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Image message styles
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },

  // Message footer styles
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#424242',
  },
  messageStatusContainer: {
    marginLeft: 4,
  },

  // Reaction styles
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionBubble: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsModal: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
  },
  reactionButton: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },

  // Typing indicator styles
  typingContainer: {
    paddingHorizontal: 14,
    marginVertical: 5,
    alignItems: 'flex-start',
  },
  typingDotsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#424242',
    marginHorizontal: 3,
  },

  // Offline indicator styles
  offlineIndicator: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Chat; 