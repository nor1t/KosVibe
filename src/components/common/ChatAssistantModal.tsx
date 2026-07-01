import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDiscovery } from '../../lib/discovery-state';
import { theme } from '../../theme';

const quickPrompts = [
  'Show me the best traditional food',
  'What monuments should I visit?',
  'Where can I buy local crafts?',
];

export function ChatAssistantModal() {
  const insets = useSafeAreaInsets();
  const {
    chatMessages,
    closeChat,
    isAssistantTyping,
    isChatOpen,
    selectedLocation,
    sendMessage,
  } = useDiscovery();
  const [draft, setDraft] = useState('');
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        sheetTranslateY.setValue(Math.max(0, gestureState.dy));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.85) {
          Animated.timing(sheetTranslateY, {
            toValue: 420,
            duration: 180,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              closeChat();
              sheetTranslateY.setValue(0);
            }
          });

          return;
        }

        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    })
  ).current;

  const handleSend = () => {
    if (!draft.trim()) {
      return;
    }

    sendMessage(draft);
    setDraft('');
  };

  return (
    <Modal visible={isChatOpen} transparent animationType="slide" onRequestClose={closeChat}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeChat} />

        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: sheetTranslateY }] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetKeyboardWrap}>
            <LinearGradient
              colors={['#171B28', '#0D1019']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
              <View {...panResponder.panHandlers}>
                <View style={styles.handle} />
                <View style={styles.header}>
                  <View style={styles.headerCopy}>
                    <View style={styles.badge}>
                      <Ionicons name="sparkles-outline" size={14} color={theme.colors.secondary} />
                      <Text style={styles.badgeText}>AI Guide</Text>
                    </View>
                    <Text style={styles.title}>KosVibe Assistant</Text>
                    <Text style={styles.subtitle}>Helping you discover {selectedLocation.label}</Text>
                  </View>
                  <Pressable onPress={closeChat} style={styles.closeButton}>
                    <Ionicons name="close" size={22} color={theme.colors.heading} />
                  </Pressable>
                </View>
              </View>

              <ScrollView
                style={styles.messagesScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}>
                <View style={styles.quickPromptsRow}>
                  {quickPrompts.map((prompt) => (
                    <Pressable key={prompt} onPress={() => sendMessage(prompt)} style={styles.quickPrompt}>
                      <Text style={styles.quickPromptText}>{prompt}</Text>
                    </Pressable>
                  ))}
                </View>

                {chatMessages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.role === 'assistant' ? styles.assistantBubble : styles.userBubble,
                    ]}>
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'assistant' ? styles.assistantText : styles.userText,
                      ]}>
                      {message.text}
                    </Text>
                  </View>
                ))}

                {isAssistantTyping ? (
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <Text style={[styles.messageText, styles.assistantText]}>Typing...</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Ask about Kosovo food, monuments, markets, or culture..."
                  placeholderTextColor={theme.colors.subtle}
                  style={styles.input}
                  multiline
                />
                <Pressable onPress={handleSend} style={styles.sendButton}>
                  <Ionicons name="arrow-up" size={20} color={theme.colors.surface} />
                </Pressable>
              </View>
            </LinearGradient>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 8, 16, 0.54)',
  },
  sheetWrap: {
    height: '84%',
    maxHeight: '90%',
    minHeight: '72%',
  },
  sheetKeyboardWrap: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    ...theme.shadow.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  headerCopy: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.22)',
    marginBottom: theme.spacing.md,
  },
  badgeText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    lineHeight: theme.typography.lineHeights.title,
    fontWeight: '800',
    color: theme.colors.heading,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.mutedText,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickPrompt: {
    backgroundColor: 'rgba(255, 31, 61, 0.14)',
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 31, 61, 0.24)',
  },
  quickPromptText: {
    fontSize: theme.typography.sizes.caption,
    color: '#FFC0C8',
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '84%',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  messageText: {
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
  assistantText: {
    color: theme.colors.text,
  },
  userText: {
    color: theme.colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadow.glow,
  },
});
