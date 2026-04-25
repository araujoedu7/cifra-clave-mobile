import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { db } from "@/src/firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
} from "react-native";

type Musica = {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  cifra?: string;
  pastaId?: string | null;
  createdBy?: string;
  createdAt?: Date;
};

type Pasta = {
  id: string;
  nome: string;
};

type SearchResult = {
  artist: string;
  title: string;
  collection?: string;
  preview?: string;
  lyrics?: string;
  trackId?: number;
  isSpecificSong: boolean;
};

type LyricsResponse = {
  lyrics?: string;
  error?: string;
};

type ITunesSong = {
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  trackId?: number;
};

type ITunesResponse = {
  results?: ITunesSong[];
};

export default function MusicasScreen() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [loading, setLoading] = useState(true);
  const alert = useAlert();

  const [menuVisible, setMenuVisible] = useState(false);
  const [musicaSelecionada, setMusicaSelecionada] = useState<Musica | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const filteredMusicas = useMemo(() => {
    const queryText = filterQuery.trim().toLowerCase();

    if (!queryText) return musicas;

    return musicas.filter((musica) => {
      const titulo = musica.titulo?.toLowerCase() ?? "";
      const artista = musica.artista?.toLowerCase() ?? "";

      return titulo.includes(queryText) || artista.includes(queryText);
    });
  }, [filterQuery, musicas]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [musicasSnap, pastasSnap] = await Promise.all([
        getDocs(query(collection(db, "musicas"), orderBy("titulo", "asc"))),
        getDocs(query(collection(db, "pastas"), orderBy("nome", "asc"))),
      ]);

      const musicasData: Musica[] = musicasSnap.docs.map((documento) => {
        const data = documento.data();

        return {
          id: documento.id,
          titulo: String(data.titulo ?? "Sem título"),
          artista: data.artista ? String(data.artista) : undefined,
          tom: data.tom ? String(data.tom) : undefined,
          cifra: data.cifra ? String(data.cifra) : undefined,
          pastaId: data.pastaId ?? null,
          createdBy: data.createdBy ? String(data.createdBy) : undefined,
          createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
        };
      });

      const pastasData: Pasta[] = pastasSnap.docs.map((documento) => {
        const data = documento.data();

        return {
          id: documento.id,
          nome: String(data.nome ?? "Sem nome"),
        };
      });

      setMusicas(musicasData);
      setPastas(pastasData);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível carregar as músicas.",
      });
    } finally {
      setLoading(false);
    }
  }, [alert]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async function buscarLetra(artist: string, title: string) {
    const data = await fetchJson<LyricsResponse>(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(
        title
      )}`
    );

    return data.lyrics?.trim() || null;
  }

  async function buscarMusica() {
    const textoBusca = searchQuery.trim();

    if (!textoBusca) {
      alert.showAlert({
        title: "Atenção",
        message: "Digite o nome da música ou artista.",
      });
      return;
    }

    setSearchLoading(true);
    setSelectedArtist("");
    setSearchResults([]);

    try {
      let artist = "";
      let title = textoBusca;

      if (textoBusca.includes(" - ")) {
        const [artistPart, ...titleParts] = textoBusca.split(" - ");
        artist = artistPart.trim();
        title = titleParts.join(" - ").trim();
      }

      if (artist && title) {
        const lyrics = await buscarLetra(artist, title);

        if (!lyrics) {
          alert.showAlert({
            title: "Não encontrado",
            message: "Música não encontrada. Tente outro artista/título.",
          });
          return;
        }

        const previewLyrics = lyrics.split("\n").slice(0, 4).join("\n");

        setSearchResults([
          {
            artist,
            title,
            lyrics,
            preview: previewLyrics,
            isSpecificSong: true,
          },
        ]);
        setSearchModalVisible(true);
        return;
      }

      setSelectedArtist(title);

      const data = await fetchJson<ITunesResponse>(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          title
        )}&entity=song&limit=50`
      );

      const songs: SearchResult[] =
        data.results
          ?.filter((song) => song.artistName && song.trackName)
          .map((song, index) => ({
            artist: String(song.artistName),
            title: String(song.trackName),
            collection: song.collectionName,
            preview: song.collectionName
              ? `Álbum: ${song.collectionName}`
              : "Álbum não informado",
            trackId: song.trackId ?? index,
            isSpecificSong: false,
          })) ?? [];

      if (songs.length === 0) {
        alert.showAlert({
          title: "Não encontrado",
          message: "Nenhuma música encontrada para este artista.",
        });
        return;
      }

      setSearchResults(songs);
      setSearchModalVisible(true);
    } catch (error) {
      console.log("Erro ao buscar música:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível buscar a música. Tente novamente.",
      });
    } finally {
      setSearchLoading(false);
    }
  }

  async function adicionarMusica(musica: SearchResult) {
    try {
      setSearchLoading(true);

      let lyrics = musica.lyrics?.trim() || null;

      if (!lyrics) {
        try {
          lyrics = await buscarLetra(musica.artist, musica.title);
        } catch (error) {
          console.log("Erro ao buscar letra:", error);
        }
      }

      await addDoc(collection(db, "musicas"), {
        titulo: musica.title,
        artista: musica.artist,
        cifra: lyrics || "Letra não encontrada",
        pastaId: null,
        createdBy: "user",
        createdAt: new Date(),
      });

      setSearchModalVisible(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedArtist("");

      await loadData();

      alert.showAlert({
        title: "Sucesso",
        message: "Música adicionada com sucesso!",
      });
    } catch (error) {
      console.log("Erro ao adicionar música:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível adicionar a música.",
      });
    } finally {
      setSearchLoading(false);
    }
  }

  function getNomeDaPasta(id?: string | null) {
    if (!id) return "Sem pasta";
    return pastas.find((pasta) => pasta.id === id)?.nome ?? "Sem pasta";
  }

  function abrirMenu(musica: Musica) {
    setMusicaSelecionada(musica);
    setMenuVisible(true);
  }

  function fecharMenu() {
    setMenuVisible(false);
  }

  async function selecionarPasta(pastaId: string | null) {
    if (!musicaSelecionada) return;

    try {
      await updateDoc(doc(db, "musicas", musicaSelecionada.id), {
        pastaId,
      });

      await loadData();
      setMenuVisible(false);
    } catch (error) {
      console.log("Erro ao selecionar pasta:", error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível atualizar a pasta da música.",
      });
    }
  }

  async function excluirMusica() {
    if (!musicaSelecionada) return;

    alert.showAlert({
      title: "Excluir música",
      message: `Deseja excluir "${musicaSelecionada.titulo}"?`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "musicas", musicaSelecionada.id));
              await loadData();
              setMenuVisible(false);
            } catch (error) {
              console.log("Erro ao excluir música:", error);
              alert.showAlert({
                title: "Erro",
                message: "Não foi possível excluir a música.",
              });
            }
          },
        },
      ],
    });
  }

  function handleMenuPress(event: GestureResponderEvent, musica: Musica) {
    event.stopPropagation();
    abrirMenu(musica);
  }

  function renderItem({ item }: { item: Musica }) {
    const metaInfo = [item.tom ? `Tom: ${item.tom}` : null, getNomeDaPasta(item.pastaId)]
      .filter(Boolean)
      .join(" • ");

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/musica/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.row}>
          <View style={styles.cardInfo}>
            <Text style={styles.title}>{item.titulo}</Text>

            {!!item.artista && <Text style={styles.subtitle}>{item.artista}</Text>}

            <Text style={styles.meta}>{metaInfo}</Text>
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={(event) => handleMenuPress(event, item)}
          >
            <Ionicons name="menu" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar música ou artista (ex: Coldplay ou Yellow)"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={buscarMusica}
        />
        <Pressable
          style={[styles.searchButton, searchLoading && styles.buttonDisabled]}
          onPress={buscarMusica}
          disabled={searchLoading}
        >
          <Text style={styles.searchButtonText}>
            {searchLoading ? "Buscando..." : "Buscar"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>Músicas</Text>
          <Text style={styles.screenSubtitle}>
            Toque em uma música para abrir a cifra
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/nova-musica")}
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </Pressable>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Filtrar músicas por título ou artista..."
          placeholderTextColor={colors.textMuted}
          style={styles.filterInput}
          value={filterQuery}
          onChangeText={setFilterQuery}
          returnKeyType="search"
        />
        {!!filterQuery && (
          <Pressable
            style={styles.clearFilterButton}
            onPress={() => setFilterQuery("")}
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={filteredMusicas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {filterQuery
                ? "Nenhuma música encontrada com este filtro."
                : "Nenhuma música cadastrada ainda."}
            </Text>
          }
        />
      )}

      <Modal
        transparent
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setSearchModalVisible(false)}
        >
          <Pressable style={styles.searchModal} onPress={() => undefined}>
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>
              {selectedArtist
                ? `Músicas de ${selectedArtist} (${searchResults.length} encontradas)`
                : "Resultado da busca"}
            </Text>

            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.trackId ?? item.title}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.searchResultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultArtist}>por {item.artist}</Text>
                  </View>

                  <View style={styles.previewContainer}>
                    {item.isSpecificSong && (
                      <Text style={styles.previewLabel}>Preview da letra:</Text>
                    )}
                    <Text
                      style={styles.previewText}
                      numberOfLines={item.isSpecificSong ? 4 : undefined}
                    >
                      {item.preview ?? "Sem preview disponível"}
                    </Text>
                  </View>

                  <View style={styles.resultActions}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setSearchModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.addMusicButton,
                        searchLoading && styles.buttonDisabled,
                      ]}
                      onPress={() => adicionarMusica(item)}
                      disabled={searchLoading}
                    >
                      <Text style={styles.addMusicButtonText}>
                        {searchLoading ? "Buscando..." : "Adicionar música"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={fecharMenu}
      >
        <Pressable style={styles.overlay} onPress={fecharMenu}>
          <Pressable style={styles.bottomSheet} onPress={() => undefined}>
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>{musicaSelecionada?.titulo}</Text>

            <Text style={styles.modalSubtitle}>Escolha a pasta</Text>

            <Text style={styles.currentFolder}>
              Atual: {getNomeDaPasta(musicaSelecionada?.pastaId)}
            </Text>

            <Pressable
              style={styles.option}
              onPress={() => selecionarPasta(null)}
            >
              <Text style={styles.optionText}>Sem pasta</Text>
            </Pressable>

            {pastas.map((pasta) => {
              const isSelected = pasta.id === musicaSelecionada?.pastaId;

              return (
                <Pressable
                  key={pasta.id}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => selecionarPasta(pasta.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {pasta.nome}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.divider} />

            <Pressable style={styles.deleteButton} onPress={excluirMusica}>
              <Text style={styles.deleteButtonText}>Excluir música</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  menuButton: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#FFFFFF",
  },
  modalSubtitle: {
    color: "#FFFFFF",
    marginBottom: 10,
  },
  currentFolder: {
    marginBottom: 12,
    fontSize: 13,
    color: "#FFFFFF",
  },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: "#B42318",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  searchModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: "90%",
  },
  modalListContent: {
    paddingBottom: 20,
  },
  searchResultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  resultArtist: {
    fontSize: 14,
    color: colors.textMuted,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  resultActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  addMusicButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addMusicButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  filterInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    paddingRight: 40,
    color: colors.text,
    fontSize: 14,
  },
  clearFilterButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
});