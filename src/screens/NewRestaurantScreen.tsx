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

const PRICE_RANGES = [
  { key: '€', label: 'Budget' },
  { key: '€€', label: 'Moderate' },
  { key: '€€€', label: 'Upscale' },
  { key: '€€€€', label: 'Fine Dining' },
];

type NewRestaurantScreenProps = {
  navigation: NavigationProp<ParamListBase>;
  route: { params: { businessId: string } };
};

export function NewRestaurantScreen({ navigation, route }: NewRestaurantScreenProps) {
  const { businessId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Restaurant name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await businessRepository.createPlaceRequest({
        businessAccountId: businessId,
        name: name.trim(),
        description: description.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        priceRange: priceRange || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
      });

      Alert.alert('Submitted', 'Your restaurant has been submitted for review. We will notify you once approved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="restaurant-outline" size={40} color={theme.colors.primary} />
          <Text style={styles.title}>New Restaurant</Text>
          <Text style={styles.subtitle}>
            Fill in your restaurant details. Our team will review and publish your listing.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Restaurant name" placeholderTextColor={theme.colors.mutedText} maxLength={100} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Brief description" placeholderTextColor={theme.colors.mutedText} multiline numberOfLines={3} maxLength={500} />
        </View>

        <View style={styles.rowGroup}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Cuisine</Text>
            <TextInput style={styles.input} value={cuisine} onChangeText={setCuisine} placeholder="Italian, Traditional..." placeholderTextColor={theme.colors.mutedText} maxLength={50} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Price Range</Text>
            <View style={styles.chipRow}>
              {PRICE_RANGES.map((pr) => (
                <Pressable
                  key={pr.key}
                  style={[styles.chip, priceRange === pr.key && styles.chipActive]}
                  onPress={() => setPriceRange(priceRange === pr.key ? '' : pr.key)}
                >
                  <Text style={[styles.chipText, priceRange === pr.key && styles.chipTextActive]}>{pr.key}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor={theme.colors.mutedText} maxLength={200} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Prishtinë, Prizren..." placeholderTextColor={theme.colors.mutedText} maxLength={100} />
        </View>

        <Text style={styles.sectionHeading}>Contact Information</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+383 44 000 000" placeholderTextColor={theme.colors.mutedText} keyboardType="phone-pad" maxLength={30} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="info@restaurant.com" placeholderTextColor={theme.colors.mutedText} keyboardType="email-address" autoCapitalize="none" maxLength={100} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://..." placeholderTextColor={theme.colors.mutedText} keyboardType="url" autoCapitalize="none" maxLength={200} />
        </View>

        <Pressable style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color={theme.colors.surface} /> : <Text style={styles.submitButtonText}>Submit for Review</Text>}
        </Pressable>

        <Text style={styles.footer}>Your restaurant will be reviewed by our team. This usually takes 1-2 business days.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: PAGE_TOP_PADDING, paddingBottom: PAGE_BOTTOM_PADDING },
  header: { marginTop: 25, alignItems: 'center', gap: 10 },
  title: { color: theme.colors.heading, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: theme.colors.mutedText, fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  formGroup: { marginTop: 20 },
  label: { color: theme.colors.heading, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: theme.colors.heading, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  rowGroup: { flexDirection: 'row', gap: 12, marginTop: 20 },
  halfField: { flex: 1 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: 'rgba(255,31,61,0.2)', borderColor: 'rgba(255,31,61,0.4)' },
  chipText: { color: theme.colors.mutedText, fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: theme.colors.heading },
  sectionHeading: { marginTop: 28, color: theme.colors.heading, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  submitButton: { marginTop: 30, paddingVertical: 16, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: '800' },
  footer: { marginTop: 16, color: theme.colors.mutedText, fontSize: 12, textAlign: 'center' },
});