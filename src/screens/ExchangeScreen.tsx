import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { WeatherSettingsButton } from '../components/common/WeatherSettingsButton';
import { useI18n } from '../i18n/I18nProvider';
import { theme } from '../theme';

type ExchangeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type RateResponse = {
  date: string;
  rates: Record<string, number>;
};

const currencies = ['USD', 'GBP', 'CHF', 'TRY', 'CAD', 'AUD', 'SEK', 'NOK', 'DKK', 'PLN'] as const;
type CurrencyCode = (typeof currencies)[number];

const exchangeCopy = {
  en: {
    title: 'Exchange to Euro',
    subtitle: 'Kosovo uses the euro. Convert common currencies into EUR with daily ECB reference rates.',
    amount: 'Amount',
    updated: 'Updated',
    source: 'Rates source: Frankfurter / ECB reference rates',
    unavailable: 'Rates unavailable right now',
    resultPrefix: 'equals',
  },
  sq: {
    title: 'Kembimi ne Euro',
    subtitle: 'Kosova perdor euron. Kthe valuta te zakonshme ne EUR me kurset ditore te BQE-se.',
    amount: 'Shuma',
    updated: 'Perditesuar',
    source: 'Burimi i kurseve: Frankfurter / kurset referente te BQE-se',
    unavailable: 'Kurset nuk jane te disponueshme tani',
    resultPrefix: 'baraz me',
  },
};

export function ExchangeScreen({ navigation }: ExchangeScreenProps) {
  const { language } = useI18n();
  const copy = exchangeCopy[language];
  const [rates, setRates] = useState<Record<string, number>>({});
  const [date, setDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`https://api.frankfurter.dev/v1/latest?from=EUR&to=${currencies.join(',')}`)
      .then((response) => response.json())
      .then((data: RateResponse) => {
        if (!active) {
          return;
        }

        setRates(data.rates ?? {});
        setDate(data.date ?? '');
      })
      .catch(() => {
        if (active) {
          setRates({});
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const parsedAmount = Number(amount.replace(',', '.'));
  const selectedRate = rates[selectedCurrency];
  const convertedAmount = useMemo(() => {
    if (!Number.isFinite(parsedAmount) || !selectedRate) {
      return null;
    }

    return parsedAmount / selectedRate;
  }, [parsedAmount, selectedRate]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.surface} />
        </Pressable>
        <WeatherSettingsButton navigation={navigation} showExchange={false} compact />
      </View>

      <View style={styles.hero}>
        <View style={styles.moneyIcon}>
          <Ionicons name="logo-euro" size={30} color={theme.colors.surface} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.converterCard}>
        <Text style={styles.label}>{copy.amount}</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="100"
            placeholderTextColor={theme.colors.subtle}
            style={styles.amountInput}
          />
          <Text style={styles.currencyBadge}>{selectedCurrency}</Text>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{copy.resultPrefix}</Text>
          <Text style={styles.resultValue}>
            {convertedAmount === null ? '--' : `EUR ${convertedAmount.toFixed(2)}`}
          </Text>
        </View>
      </View>

      <View style={styles.currencyGrid}>
        {currencies.map((currency) => {
          const active = currency === selectedCurrency;
          const rate = rates[currency];

          return (
            <Pressable
              key={currency}
              style={[styles.currencyCard, active && styles.currencyCardActive]}
              onPress={() => setSelectedCurrency(currency)}>
              <Text style={[styles.currencyCode, active && styles.currencyCodeActive]}>{currency}</Text>
              <Text style={styles.currencyRate}>
                {rate ? `1 EUR = ${rate.toFixed(4)}` : '--'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sourceText}>
        {isLoading ? copy.unavailable : `${copy.updated}: ${date || '--'} | ${copy.source}`}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,179,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.18)',
  },
  moneyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,31,61,0.28)',
    marginBottom: 18,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 10,
    color: theme.colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
  },
  converterCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inputRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountInput: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 16,
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  currencyBadge: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 14,
  },
  resultBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,31,61,0.14)',
  },
  resultLabel: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  resultValue: {
    marginTop: 4,
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: '900',
  },
  currencyGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyCard: {
    width: '47.8%',
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  currencyCardActive: {
    backgroundColor: 'rgba(255,179,0,0.16)',
    borderColor: 'rgba(255,179,0,0.34)',
  },
  currencyCode: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: '900',
  },
  currencyCodeActive: {
    color: theme.colors.secondary,
  },
  currencyRate: {
    marginTop: 6,
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  sourceText: {
    marginTop: 18,
    color: theme.colors.subtle,
    fontSize: 12,
    lineHeight: 18,
  },
});
