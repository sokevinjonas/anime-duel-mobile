import { View, Text, StyleSheet } from 'react-native';

export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anime Duel</Text>
      <Text style={styles.subtitle}>Connexion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e94560', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#fff' },
});
