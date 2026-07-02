import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!draft.trim()) {
      return;
    }

    sendMessage(draft);
    setDraft('');

    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <Modal
      visible={isChatOpen}
      transparent={false}
      animationType="slide"
      onRequestClose={closeChat}
      statusBarTranslucent>
      <View style={styles.screen}>
        <LinearGradient
          colors={['#0D1019', '#0A0C14']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.gradient}>
          {/* Header */}
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
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

          {/* Messages area */}
          <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
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

              {/* Extra bottom padding so last message isn't hidden behind input */}
              <View style={{ height: 12 }} />
            </ScrollView>

            {/* Input bar pinned to bottom */}
            <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask about Kosovo food, monuments, markets, or culture..."
                placeholderTextColor={theme.colors.subtle}
                style={styles.input}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <Pressable onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="arrow-up" size={20} color={theme.colors.surface} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0C14',
  },
  gradient: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
    marginTop: 4,
  },
  messagesScroll: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
  },
  messagesContent: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: 4,
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
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0A0C14',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
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
    marginBottom: 4,
    ...theme.shadow.glow,
  },
});