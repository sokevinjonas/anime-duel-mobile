import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

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
  const [search, setSearch] = useState('');
  const { data, loading } = useQuery<any>(CHARACTERS_QUERY, {
    variables: { search: search || undefined },
  });

  const characters = data?.characters || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Catalogue</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un personnage..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.charName}>{item.name}</Text>
                <Text style={styles.animeName}>{item.anime.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun personnage trouvé</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  animeName: {
    fontSize: 14,
    color: '#e94560',
  },
  loadingText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
