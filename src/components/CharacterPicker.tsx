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
import { MaterialIcons } from '@expo/vector-icons';
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
  selectedId?: string | null; // Controlled selection
  onConfirm?: () => void; // Optional separate confirm button
  showConfirmButton?: boolean; // Show validate button
  disabled?: boolean; // Disable selection
}

export function CharacterPicker({
  visible,
  onSelect,
  onClose,
  selectedId,
  onConfirm,
  showConfirmButton = false,
  disabled = false,
}: CharacterPickerProps) {
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
            <Text style={[styles.closeBtn, { color: colors.primary, fontFamily: fonts.bodyBold }]}>Fermer</Text>
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
          renderItem={({ item }: { item: any }) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                    borderLeftWidth: isSelected ? 4 : 0,
                    borderLeftColor: colors.primary,
                  },
                ]}
                onPress={() => !disabled && onSelect({ id: item.id, name: item.name })}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <Text style={[styles.itemName, { color: colors.text, fontFamily: fonts.bodyBold }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemAnime, { color: colors.primary, fontFamily: fonts.body }]}>
                  {item.anime.title}
                </Text>
                {isSelected && (
                  <MaterialIcons name="check-circle" size={24} color={colors.success} />
                )}
              </TouchableOpacity>
            );
          }}
        />
        {showConfirmButton && (
          <View style={[styles.confirmContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: selectedId ? colors.success : colors.border,
                },
              ]}
              onPress={onConfirm}
              disabled={!selectedId || disabled}
            >
              <Text style={[styles.confirmBtnText, { color: '#FFF', fontFamily: fonts.bodyBold }]}>
                VALIDER
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingBottom: 80 },
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
  confirmContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
  },
});
