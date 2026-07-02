import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDiscovery } from '../../lib/discovery-state';
import { theme } from '../../theme';

type WeatherSettingsButtonProps = {
  navigation: NavigationProp<ParamListBase>;
  showSettings?: boolean;
  showHistory?: boolean;
  showHelp?: boolean;
  showExchange?: boolean;
  compact?: boolean;
  collapseInfoActions?: boolean;
  showWeather?: boolean;
};

type WeatherState = {
  temperature: number | null;
  code: number | null;
};

type InfoMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
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
  collapseInfoActions = false,
  showWeather = true,
}: WeatherSettingsButtonProps) {
  const { selectedLocation } = useDiscovery();
  const [weather, setWeather] = useState<WeatherState>({ temperature: null, code: null });
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

  const weatherUrl = useMemo(() => {
    const { latitude, longitude } = selectedLocation.region;
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
  }, [selectedLocation.region]);

  useEffect(() => {
    if (!showWeather) {
      return;
    }

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
  }, [showWeather, weatherUrl]);

  const temperatureLabel = weather.temperature === null ? '--' : `${weather.temperature}`;
  const infoMenuItems: InfoMenuItem[] = [
    ...(showExchange
      ? [
          {
            key: 'exchange',
            label: 'Exchange',
            icon: 'logo-usd' as const,
            action: () => navigation.navigate('Exchange'),
          },
        ]
      : []),
    ...(showHelp
      ? [
          {
            key: 'help',
            label: 'About & Support',
            icon: 'help-outline' as const,
            action: () => navigation.navigate('Help'),
          },
        ]
      : []),
    ...(showHistory
      ? [
          {
            key: 'history',
            label: 'History of Kosova',
            icon: 'book-outline' as const,
            action: () => navigation.navigate('History'),
          },
        ]
      : []),
    ...(showSettings
      ? [
          {
            key: 'settings',
            label: 'Settings',
            icon: 'settings-outline' as const,
            action: () => navigation.navigate('Settings'),
          },
        ]
      : []),
  ];

  return (
    <>
      <View style={[styles.wrap, compact && styles.compactWrap]}>
        {showWeather ? (
          <View style={[styles.weatherPill, compact && styles.compactWeatherPill]}>
            <Ionicons
              name={weatherIconForCode(weather.code)}
              size={18}
              color={theme.colors.secondary}
            />
            <Text style={styles.temperature}>{temperatureLabel} deg</Text>
          </View>
        ) : null}

        <View style={styles.actionGroup}>
          {collapseInfoActions && infoMenuItems.length ? (
            <Pressable
              accessibilityLabel="Open quick links menu"
              style={[styles.actionButton, compact && styles.compactActionButton]}
              onPress={() => setIsInfoMenuOpen(true)}>
              <View style={styles.menuLinesWrap}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </Pressable>
          ) : null}

          {!collapseInfoActions && showExchange ? (
            <Pressable
              accessibilityLabel="Open exchange rates"
              style={[styles.actionButton, compact && styles.compactActionButton]}
              onPress={() => navigation.navigate('Exchange')}>
              <Ionicons name="logo-usd" size={20} color={theme.colors.surface} />
            </Pressable>
          ) : null}

          {!collapseInfoActions && showHelp ? (
            <Pressable
              accessibilityLabel="Open about and support"
              style={[styles.actionButton, compact && styles.compactActionButton]}
              onPress={() => navigation.navigate('Help')}>
              <Ionicons name="help-outline" size={21} color={theme.colors.surface} />
            </Pressable>
          ) : null}

          {!collapseInfoActions && showHistory ? (
            <Pressable
              accessibilityLabel="Open Kosovo history"
              style={[styles.actionButton, compact && styles.compactActionButton]}
              onPress={() => navigation.navigate('History')}>
              <Ionicons name="book-outline" size={20} color={theme.colors.surface} />
            </Pressable>
          ) : null}

          {!collapseInfoActions && showSettings ? (
            <Pressable
              accessibilityLabel="Open settings"
              style={[styles.actionButton, compact && styles.compactActionButton]}
              onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={21} color={theme.colors.surface} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Modal
        transparent
        visible={isInfoMenuOpen}
        animationType="fade"
        onRequestClose={() => setIsInfoMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setIsInfoMenuOpen(false)}>
          <View style={[styles.infoMenu, compact && styles.compactInfoMenu]}>
            {infoMenuItems.map((item) => (
              <Pressable
                key={item.key}
                style={styles.infoMenuItem}
                onPress={() => {
                  setIsInfoMenuOpen(false);
                  item.action();
                }}>
                <Ionicons name={item.icon} size={18} color={theme.colors.heading} />
                <Text style={styles.infoMenuText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    ...theme.shadow.card,
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
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card,
  },
  compactActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  menuLinesWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  menuLine: {
    width: 16,
    height: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.34)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 82,
    paddingRight: 18,
  },
  infoMenu: {
    width: 228,
    borderRadius: theme.radius.lg,
    backgroundColor: '#151925',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  compactInfoMenu: {
    marginTop: -6,
  },
  infoMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  infoMenuText: {
    color: theme.colors.heading,
    fontSize: theme.typography.sizes.body,
    fontWeight: '700',
  },
});
