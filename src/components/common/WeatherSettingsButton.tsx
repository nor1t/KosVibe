import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDiscovery } from '../../lib/discovery-state';
import { theme } from '../../theme';

type WeatherSettingsButtonProps = {
  navigation: NavigationProp<ParamListBase>;
  showSettings?: boolean;
  showHistory?: boolean;
  showHelp?: boolean;
  showExchange?: boolean;
  compact?: boolean;
};

type WeatherState = {
  temperature: number | null;
  code: number | null;
};

function weatherIconForCode(code: number | null) {
  if (code === null) {
    return 'partly-sunny-outline' as const;
  }

  if (code === 0 || code === 1) {
    return 'sunny-outline' as const;
  }

  if (code === 2 || code === 3) {
    return 'partly-sunny-outline' as const;
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'rainy-outline' as const;
  }

  if (code >= 71 && code <= 77) {
    return 'snow-outline' as const;
  }

  if (code >= 95) {
    return 'thunderstorm-outline' as const;
  }

  return 'cloud-outline' as const;
}

export function WeatherSettingsButton({
  navigation,
  showSettings = true,
  showHistory = true,
  showHelp = true,
  showExchange = true,
  compact = false,
}: WeatherSettingsButtonProps) {
  const { selectedLocation } = useDiscovery();
  const [weather, setWeather] = useState<WeatherState>({ temperature: null, code: null });

  const weatherUrl = useMemo(() => {
    const { latitude, longitude } = selectedLocation.region;
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
  }, [selectedLocation.region]);

  useEffect(() => {
    let active = true;

    fetch(weatherUrl)
      .then((response) => response.json())
      .then((data) => {
        if (!active) {
          return;
        }

        const temperature = Number(data?.current?.temperature_2m);
        const code = Number(data?.current?.weather_code);

        setWeather({
          temperature: Number.isFinite(temperature) ? Math.round(temperature) : null,
          code: Number.isFinite(code) ? code : null,
        });
      })
      .catch(() => {
        if (active) {
          setWeather({ temperature: null, code: null });
        }
      });

    return () => {
      active = false;
    };
  }, [weatherUrl]);

  const temperatureLabel = weather.temperature === null ? '--' : `${weather.temperature}`;

  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      <View style={[styles.weatherPill, compact && styles.compactWeatherPill]}>
        <Ionicons name={weatherIconForCode(weather.code)} size={18} color={theme.colors.secondary} />
        <Text style={styles.temperature}>{temperatureLabel}°</Text>
      </View>

      <View style={styles.actionGroup}>
        {showExchange ? (
          <Pressable
            accessibilityLabel="Open exchange rates"
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={() => navigation.navigate('Exchange')}>
            <Ionicons name="logo-usd" size={20} color={theme.colors.surface} />
          </Pressable>
        ) : null}

        {showHelp ? (
          <Pressable
            accessibilityLabel="Open important numbers"
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={() => navigation.navigate('Help')}>
            <Ionicons name="help-outline" size={21} color={theme.colors.surface} />
          </Pressable>
        ) : null}

        {showHistory ? (
          <Pressable
            accessibilityLabel="Open Kosovo history"
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={() => navigation.navigate('History')}>
            <Ionicons name="book-outline" size={20} color={theme.colors.surface} />
          </Pressable>
        ) : null}

        {showSettings ? (
          <Pressable
            accessibilityLabel="Open settings"
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={21} color={theme.colors.surface} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  compactWrap: {
    gap: 8,
  },
  weatherPill: {
    minWidth: 86,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  compactWeatherPill: {
    minWidth: 74,
    height: 42,
  },
  temperature: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
