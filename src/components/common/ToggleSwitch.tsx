import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '../../theme';

type ToggleSwitchProps = {
  value: boolean;
  onValueChange?: (nextValue: boolean) => void;
};

export function ToggleSwitch({ value, onValueChange }: ToggleSwitchProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[
        styles.track,
        value ? styles.trackEnabled : styles.trackDisabled,
      ]}>
      <View style={[styles.thumb, value ? styles.thumbEnabled : styles.thumbDisabled]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 66,
    height: 36,
    borderRadius: theme.radius.round,
    padding: 3,
    justifyContent: 'center',
  },
  trackEnabled: {
    backgroundColor: theme.colors.primary,
  },
  trackDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.surface,
  },
  thumbEnabled: {
    alignSelf: 'flex-end',
  },
  thumbDisabled: {
    alignSelf: 'flex-start',
  },
});
