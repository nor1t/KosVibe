import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '../components/Screen';
import { businessRepository } from '../features/business/businessRepository';
import { theme } from '../theme';
import type { CreateBusinessInput } from '../repositories/types';

type BusinessRegistrationScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BUSINESS_TYPES = [
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' as const },
  { key: 'venue', label: 'Venue', icon: 'business-outline' as const },
  { key: 'service', label: 'Service', icon: 'construct-outline' as const },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

export function BusinessRegistrationScreen({ navigation }: BusinessRegistrationScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState<string>('restaurant');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a business name.');
      return;
    }

    setSubmitting(true);
    try {
      const input: CreateBusinessInput = {
        name: trimmedName,
        description: description.trim() || undefined,
        businessType,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
      };

      await businessRepository.createBusiness(input);
      Alert.alert('Success', 'Your business has been registered and is pending approval.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="business-outline" size={40} color={theme.colors.primary} />
          <Text style={styles.title}>Register Your Business</Text>
          <Text style={styles.subtitle}>
            Create a business profile to manage your restaurants, menus, and more.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your restaurant or business name"
            placeholderTextColor={theme.colors.mutedText}
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us about your business"
            placeholderTextColor={theme.colors.mutedText}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Type</Text>
          <View style={styles.typeRow}>
            {BUSINESS_TYPES.map((type) => (
              <Pressable
                key={type.key}
                style={[
                  styles.typeChip,
                  businessType === type.key && styles.typeChipActive,
                ]}
                onPress={() => setBusinessType(type.key)}
              >
                <Ionicons
                  name={type.icon}
                  size={16}
                  color={businessType === type.key ? theme.colors.surface : theme.colors.mutedText}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    businessType === type.key && styles.typeChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="business@example.com"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+383 44 000 000"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://yourbusiness.com"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>Register Business</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>
          Your business will be reviewed by our team before it goes live.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  header: {
    marginTop: 25,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    color: theme.colors.heading,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.heading,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(255,31,61,0.25)',
    borderColor: 'rgba(255,31,61,0.4)',
  },
  typeChipText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: theme.colors.surface,
  },
  submitButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    marginTop: 16,
    color: theme.colors.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
});