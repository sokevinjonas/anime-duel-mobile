import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.title, { color: colors.textSecondary, fontFamily: fonts.bodySemiBold }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 24 },
});
