import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const CHARACTERS_QUERY = gql`
  query Characters($search: String) {
    characters(search: $search) {
      id
      name
      imageUrl
      anime {
        title
      }
    }
  }
`;

export function CatalogScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const { data, loading } = useQuery<any>(CHARACTERS_QUERY, {
    variables: { search: search || undefined },
  });

  const characters = data?.characters || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text, fontFamily: fonts.heading }]}>CATALOGUE</Text>
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
        placeholder="Rechercher un personnage..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.charName, { color: colors.text, fontFamily: fonts.bodyBold }]}>{item.name}</Text>
              <Text style={[styles.animeName, { color: colors.cta, fontFamily: fonts.body }]}>{item.anime.title}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fonts.body }]}>Aucun personnage trouve</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { fontSize: 22, textAlign: 'center', marginBottom: 16 },
  searchInput: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  list: { paddingHorizontal: 16, gap: 8 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charName: { fontSize: 15 },
  animeName: { fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40 },
});
