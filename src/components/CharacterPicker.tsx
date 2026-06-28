import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const CHARACTERS_QUERY = gql`
  query Characters($search: String) {
    characters(search: $search) {
      id
      name
      anime {
        title
      }
    }
  }
`;

interface CharacterPickerProps {
  visible: boolean;
  onSelect: (character: { id: string; name: string }) => void;
  onClose: () => void;
}

export function CharacterPicker({ visible, onSelect, onClose }: CharacterPickerProps) {
  const [search, setSearch] = useState('');
  const { data } = useQuery<any>(CHARACTERS_QUERY, {
    variables: { search: search || undefined },
    skip: !visible,
  });

  const characters = data?.characters || [];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisis ton personnage</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Fermer</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={characters}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect({ id: item.id, name: item.name })}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemAnime}>{item.anime.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    color: '#e94560',
    fontSize: 16,
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
  },
  itemAnime: {
    fontSize: 14,
    color: '#e94560',
  },
});
