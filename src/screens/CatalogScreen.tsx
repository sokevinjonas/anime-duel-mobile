import { View, Text, StyleSheet } from 'react-native';

export function CatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
