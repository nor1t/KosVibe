import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppLogo } from '@/src/components/AppLogo';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getAuthErrorMessage } from '@/src/features/auth/errors';
import { createSignInSchema, type SignInFormValues } from '@/src/features/auth/validation';
import { useI18n } from '@/src/i18n/I18nProvider';
import type { AuthStackParamList } from '@/src/navigation/types';
import { theme } from '@/src/theme';
import { Screen } from '@/src/components/Screen';
import { useNavigation } from '@react-navigation/native';

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

const highlights = [
  { icon: 'location-outline', label: 'Saved places' },
  { icon: 'map-outline', label: 'Map routes' },
  { icon: 'book-outline', label: 'Local stories' },
] as const;

export function SignInScreen() {
  const navigation = useNavigation<Navigation>();
  const { signInWithPassword } = useAuth();
  const { messages } = useI18n();
  const schema = useMemo(() => createSignInSchema(messages.auth), [messages.auth]);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSignIn = handleSubmit(async (values) => {
    setErrorMessage('');

    try {
      await signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, messages.auth, messages.auth.signInErrorFallback)
      );
    }
  });

  return (
    <Screen scrollable style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.backdropTop} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.stack}>
        <View style={styles.topRow}>
          <AppLogo compact />
          <LanguageSwitcher />
        </View>

        <LinearGradient
          colors={['rgba(255, 179, 0, 0.24)', 'rgba(255, 140, 0, 0.14)', 'rgba(0, 0, 0, 0)']}
          style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles-outline" size={14} color={theme.colors.surface} />
            <Text style={styles.heroBadgeText}>{messages.auth.badge}</Text>
          </View>

          <Text style={styles.heroTitle}>{messages.auth.signInTitle}</Text>
          <Text style={styles.heroSubtitle}>{messages.auth.signInSubtitle}</Text>

          <View style={styles.highlightRow}>
            {highlights.map((item) => (
              <View key={item.label} style={styles.highlightPill}>
                <Ionicons name={item.icon as never} size={14} color={theme.colors.secondary} />
                <Text style={styles.highlightText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.formShell}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#FFB5A1" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{messages.auth.email}</Text>
                <View
                  style={[
                    styles.inputShell,
                    fieldState.error ? styles.inputShellError : undefined,
                  ]}>
                  <Ionicons name="mail-outline" size={18} color={theme.colors.secondary} />
                  <TextInput
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={messages.auth.emailPlaceholder}
                    placeholderTextColor="#8F95A8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    style={styles.input}
                  />
                </View>
                {fieldState.error ? (
                  <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{messages.auth.password}</Text>
                <View
                  style={[
                    styles.inputShell,
                    fieldState.error ? styles.inputShellError : undefined,
                  ]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.colors.secondary} />
                  <TextInput
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={messages.auth.passwordPlaceholder}
                    placeholderTextColor="#8F95A8"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    style={styles.input}
                  />
                </View>
                {fieldState.error ? (
                  <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting || !isValid}
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.primaryButton,
              (isSubmitting || !isValid) && styles.primaryButtonDisabled,
              pressed && !isSubmitting && isValid ? styles.primaryButtonPressed : undefined,
            ]}>
            <LinearGradient colors={['#FFD166', '#FF8C00']} style={styles.primaryButtonFill}>
              <Ionicons name="sparkles-outline" size={18} color="#1B1206" />
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? messages.auth.signInPending : messages.auth.signInCta}
              </Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.serviceNotice}>{messages.auth.serviceNotice}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCopy}>{messages.auth.noAccount}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.footerButton}>
            <Text style={styles.footerButtonText}>{messages.auth.createAccountCta}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xxxxl,
  },
  backdropTop: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: 'rgba(255, 179, 0, 0.04)',
  },
  stack: {
    gap: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: {
    borderRadius: 28,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.18)',
    backgroundColor: 'rgba(255, 179, 0, 0.08)',
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroBadgeText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 18,
    color: theme.colors.heading,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    maxWidth: 300,
  },
  heroSubtitle: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  highlightRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(7, 8, 16, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.15)',
  },
  highlightText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  formShell: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: 28,
    backgroundColor: 'rgba(14, 15, 24, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.14)',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 85, 60, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 60, 0.2)',
  },
  errorBannerText: {
    flex: 1,
    color: '#FFD7CC',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: '#F4F6FB',
    fontSize: 13,
    fontWeight: '700',
  },
  inputShell: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputShellError: {
    borderColor: 'rgba(255, 179, 0, 0.5)',
    backgroundColor: 'rgba(255, 179, 0, 0.08)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: theme.colors.heading,
    fontSize: 16,
  },
  fieldError: {
    color: '#FFB5A1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  primaryButtonFill: {
    minHeight: 58,
    borderRadius: theme.radius.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.xl,
  },
  primaryButtonText: {
    color: '#1B1206',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceNotice: {
    color: theme.colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  footerCopy: {
    flex: 1,
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  footerButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerButtonText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
});
