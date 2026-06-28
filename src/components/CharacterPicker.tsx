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
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

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
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const { data } = useQuery<any>(CHARACTERS_QUERY, {
    variables: { search: search || undefined },
    skip: !visible,
  });

  const characters = data?.characters || [];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.heading }]}>CHOISIS TON PERSO</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.closeBtn, { color: colors.cta, fontFamily: fonts.bodyBold }]}>Fermer</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: fonts.body }]}
          placeholder="Rechercher..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={characters}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => onSelect({ id: item.id, name: item.name })}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemName, { color: colors.text, fontFamily: fonts.bodyBold }]}>{item.name}</Text>
              <Text style={[styles.itemAnime, { color: colors.cta, fontFamily: fonts.body }]}>{item.anime.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: { fontSize: 18 },
  closeBtn: { fontSize: 15 },
  searchInput: {
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  itemName: { fontSize: 15 },
  itemAnime: { fontSize: 13 },
});
