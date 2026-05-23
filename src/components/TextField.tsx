import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, style, ...props }: TextFieldProps) {
  const helperText = error ?? hint;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color={stylesPalette.labelText}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={stylesPalette.placeholderText}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        {...props}
      />
      {helperText ? (
        <AppText
          variant="caption"
          color={error ? theme.colors.danger : theme.colors.mutedText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const stylesPalette = {
  labelText: '#1B2133',
  inputText: '#151A27',
  inputSurface: '#FFFDFC',
  inputBorder: 'rgba(21, 26, 39, 0.12)',
  inputFocusRing: 'rgba(255, 179, 0, 0.22)',
  placeholderText: '#7D8498',
} as const;

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: stylesPalette.inputBorder,
    backgroundColor: stylesPalette.inputSurface,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: stylesPalette.inputText,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
});
