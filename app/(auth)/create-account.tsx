import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '@/src/components/AppButton';
import { AppLogo } from '@/src/components/AppLogo';
import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { FormTextField } from '@/src/components/FormTextField';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { NoticeBanner } from '@/src/components/NoticeBanner';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getAuthErrorMessage } from '@/src/features/auth/errors';
import { createSignUpSchema, type SignUpFormValues } from '@/src/features/auth/validation';
import { useI18n } from '@/src/i18n/I18nProvider';
import { theme } from '@/src/theme';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { messages } = useI18n();
  const { signUpWithPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const schema = createSignUpSchema(messages.auth);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleCreateAccount = handleSubmit(async (values) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const session = await signUpWithPassword({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      if (session) {
        router.replace('/(tabs)');
        return;
      }

      reset();
      setSuccessMessage(messages.auth.signUpSuccess);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, messages.auth, messages.auth.signUpErrorFallback)
      );
    }
  });

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.stack}>
        <View style={styles.topRow}>
          <AppLogo />
          <LanguageSwitcher />
        </View>

        <View style={styles.copyBlock}>
          <AppText variant="eyebrow">{messages.auth.badge}</AppText>
          <AppText variant="display">{messages.auth.createAccountTitle}</AppText>
          <AppText variant="body" color={theme.colors.mutedText}>
            {messages.auth.createAccountSubtitle}
          </AppText>
        </View>

        <Card style={styles.formCard}>
          {errorMessage ? <NoticeBanner message={errorMessage} variant="error" /> : null}
          {successMessage ? <NoticeBanner message={successMessage} variant="success" /> : null}

          <FormTextField
            control={control}
            name="fullName"
            label={messages.auth.fullName}
            placeholder={messages.auth.fullNamePlaceholder}
            textContentType="name"
          />
          <FormTextField
            control={control}
            name="email"
            label={messages.auth.email}
            placeholder={messages.auth.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
          <FormTextField
            control={control}
            name="password"
            label={messages.auth.password}
            placeholder={messages.auth.passwordPlaceholder}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
          <FormTextField
            control={control}
            name="confirmPassword"
            label={messages.auth.confirmPassword}
            placeholder={messages.auth.confirmPasswordPlaceholder}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
          <AppButton
            label={
              isSubmitting
                ? messages.auth.createProfilePending
                : messages.auth.createProfileCta
            }
            onPress={handleCreateAccount}
            isLoading={isSubmitting}
            disabled={!isValid}
          />
          <AppText variant="caption" color={theme.colors.mutedText}>
            {messages.auth.serviceNotice}
          </AppText>
        </Card>

        <View style={styles.footer}>
          <AppText variant="body" color={theme.colors.mutedText}>
            {messages.auth.haveAccount}
          </AppText>
          <Link href="/sign-in" asChild>
            <AppButton label={messages.auth.signInCta} variant="ghost" />
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  stack: {
    gap: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  copyBlock: {
    gap: theme.spacing.sm,
  },
  formCard: {
    gap: theme.spacing.lg,
    backgroundColor: '#FFF7F1',
    borderColor: 'rgba(255, 179, 0, 0.14)',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  footer: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
});
