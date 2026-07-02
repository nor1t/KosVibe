import { Ionicons } from '@expo/vector-icons';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>
          <Pressable style={styles.retryButton} onPress={this.handleRetry}>
            <Ionicons name="refresh-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, backgroundColor: theme.colors.background, gap: 16,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,31,61,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  title: { color: theme.colors.heading, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  message: { color: theme.colors.mutedText, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  retryButton: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryText: { color: theme.colors.surface, fontSize: 15, fontWeight: '900' },
});