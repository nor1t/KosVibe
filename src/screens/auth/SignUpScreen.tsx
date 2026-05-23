import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
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

import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { GradientHeaderShell } from '../../components/layout/GradientHeaderShell';
import { Screen } from '../../components/layout/Screen';
import { useAuth } from '../../features/auth/AuthProvider';
import { getAuthErrorMessage } from '../../features/auth/errors';
import { createSignUpSchema } from '../../features/auth/validation';
import { useI18n } from '../../i18n/I18nProvider';
import type { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme';

type SignUpValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<Navigation>();
  const { signUpWithPassword } = useAuth();
  const { messages } = useI18n();
  const schema = useMemo(() => createSignUpSchema(messages.auth), [messages.auth]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const values = watch();

  const onSubmit = handleSubmit(async (formValues) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const session = await signUpWithPassword({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (!session) {
        setSuccessMessage(messages.auth.signUpSuccess);
      }
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, messages.auth, messages.auth.signUpErrorFallback)
      );
    }
  });

  return (
    <Screen contentContainerStyle={styles.authContent}>
      <GradientHeaderShell style={styles.authHeader}>
        <View style={styles.languageSwitchWrap}>
          <LanguageSwitcher />
        </View>
        <Text style={styles.authBrand}>KOSVIBE</Text>
        <Text style={styles.authTitle}>{messages.auth.createAccountTitle}</Text>
        <Text style={styles.authSubtitle}>
          {messages.auth.createAccountSubtitle}
        </Text>
      </GradientHeaderShell>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.authCard}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{messages.auth.fullName}</Text>
            <TextInput
              value={values.fullName}
              onChangeText={(text) => setValue('fullName', text, { shouldValidate: true })}
              placeholder={messages.auth.fullNamePlaceholder}
              placeholderTextColor={theme.colors.subtle}
              style={styles.input}
            />
            {errors.fullName?.message ? <Text style={styles.errorText}>{errors.fullName.message}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{messages.auth.email}</Text>
            <TextInput
              value={values.email}
              onChangeText={(text) => setValue('email', text, { shouldValidate: true })}
              placeholder={messages.auth.emailPlaceholder}
              placeholderTextColor={theme.colors.subtle}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.email?.message ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{messages.auth.password}</Text>
            <TextInput
              value={values.password}
              onChangeText={(text) => setValue('password', text, { shouldValidate: true })}
              placeholder={messages.auth.passwordPlaceholder}
              placeholderTextColor={theme.colors.subtle}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.password?.message ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{messages.auth.confirmPassword}</Text>
            <TextInput
              value={values.confirmPassword}
              onChangeText={(text) => setValue('confirmPassword', text, { shouldValidate: true })}
              placeholder={messages.auth.confirmPasswordPlaceholder}
              placeholderTextColor={theme.colors.subtle}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.confirmPassword?.message ? (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            ) : null}
          </View>

          {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successBanner}>{successMessage}</Text> : null}

          <Pressable style={styles.primaryCta} onPress={onSubmit} disabled={isSubmitting}>
            <Text style={styles.primaryCtaText}>
              {isSubmitting ? messages.auth.createProfilePending : messages.auth.createProfileCta}
            </Text>
          </Pressable>

          <View style={styles.authFooterRow}>
            <Text style={styles.authFooterText}>{messages.auth.haveAccount}</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.authLink}>{messages.auth.signInCta}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  authContent: {
    gap: theme.spacing.xxxl,
  },
  authHeader: {
    paddingBottom: theme.spacing.xxxl,
  },
  languageSwitchWrap: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  authBrand: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: theme.spacing.xl,
  },
  authTitle: {
    color: theme.colors.surface,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  authSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  authCard: {
    marginHorizontal: theme.spacing.xxl,
    backgroundColor: '#FFF7F1',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    gap: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.14)',
    ...theme.shadow.card,
  },
  fieldWrap: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.label,
    fontWeight: '600',
    color: '#1B2133',
  },
  input: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 39, 0.12)',
    backgroundColor: '#FFFDFC',
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: '#151A27',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.caption,
  },
  errorBanner: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
  successBanner: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.lineHeights.body,
  },
  primaryCta: {
    minHeight: 52,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.title,
    fontWeight: '700',
  },
  authFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  authFooterText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.mutedText,
  },
  authLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
