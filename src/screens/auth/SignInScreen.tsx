import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { GradientHeaderShell } from '../../components/layout/GradientHeaderShell';
import { Screen } from '../../components/layout/Screen';
import { useAuth } from '../../features/auth/AuthProvider';
import type { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme';

type SignInValues = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export function SignInScreen() {
  const navigation = useNavigation<Navigation>();
  const { signInWithPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const values = watch();

  const onSubmit = handleSubmit(async (formValues) => {
    setErrorMessage('');

    try {
      await signInWithPassword({
        email: formValues.email.trim(),
        password: formValues.password,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  });

  return (
    <Screen contentContainerStyle={styles.authContent}>
      <GradientHeaderShell style={styles.authHeader}>
        <Text style={styles.authBrand}>YUMMY KOSOVA</Text>
        <Text style={styles.authTitle}>Welcome back</Text>
        <Text style={styles.authSubtitle}>
          Sign in to keep your bookings, favorites, and profile synced.
        </Text>
      </GradientHeaderShell>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.authCard}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={values.email}
              onChangeText={(text) => setValue('email', text, { shouldValidate: true })}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.subtle}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.email?.message ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={values.password}
              onChangeText={(text) => setValue('password', text, { shouldValidate: true })}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.subtle}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.password?.message ? (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            ) : null}
          </View>

          {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

          <Pressable style={styles.primaryCta} onPress={onSubmit} disabled={isSubmitting}>
            <Text style={styles.primaryCtaText}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
          </Pressable>

          <View style={styles.authFooterRow}>
            <Text style={styles.authFooterText}>Do not have an account?</Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.authLink}>Create one</Text>
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
    maxWidth: 280,
  },
  authCard: {
    marginHorizontal: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    gap: theme.spacing.xl,
    ...theme.shadow.card,
  },
  fieldWrap: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.label,
    fontWeight: '600',
    color: theme.colors.heading,
  },
  input: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.heading,
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
