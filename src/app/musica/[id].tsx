import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { db } from "@/src/firebase/config";

type Musica = {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  cifra?: string;
};

const TOMS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BEMOIS_PARA_SUSTENIDOS: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

function normalizarTom(tom: string) {
  return BEMOIS_PARA_SUSTENIDOS[tom] ?? tom;
}

function transposeChord(chord: string, steps: number) {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);

  if (!match) return chord;

  const raizOriginal = match[1];
  const sufixo = match[2] ?? "";
  const raiz = normalizarTom(raizOriginal);
  const index = TOMS.indexOf(raiz);

  if (index === -1) return chord;

  let novoIndex = (index + steps) % TOMS.length;
  if (novoIndex < 0) novoIndex += TOMS.length;

  return `${TOMS[novoIndex]}${sufixo}`;
}

function transporCifra(texto: string, steps: number) {
  if (!texto.trim() || steps === 0) return texto;

  return texto.replace(/\b([A-G](?:#|b)?(?:m|maj7|maj9|maj|sus2|sus4|sus|dim|aug|add9|add11|m7|m9|m11|m6|7|9|11|13|6)?(?:\/[A-G](?:#|b)?)?)\b/g, (match) => {
    if (match.includes("/")) {
      const [principal, baixo] = match.split("/");
      return `${transposeChord(principal, steps)}/${transposeChord(baixo, steps)}`;
    }

    return transposeChord(match, steps);
  });
}

export default function MusicaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [musica, setMusica] = useState<Musica | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [transposition, setTransposition] = useState(0);
  const [autoScrollAtivo, setAutoScrollAtivo] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);

  const scrollRef = useRef<ScrollView>(null);
  const currentOffsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadMusica() {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const ref = doc(db, "musicas", String(id));
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        setMusica(null);
        return;
      }

      const data = snapshot.data();

      setMusica({
        id: snapshot.id,
        titulo: data.titulo ?? "",
        artista: data.artista ?? "",
        tom: data.tom ?? "",
        cifra: data.cifra ?? "",
      });
    } catch (error) {
      console.log("Erro ao carregar música:", error);
      setMusica(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMusica();
  }, [id]);

  useEffect(() => {
    if (!autoScrollAtivo) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      currentOffsetRef.current += scrollSpeed;
      scrollRef.current?.scrollTo({
        y: currentOffsetRef.current,
        animated: false,
      });
    }, 60);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoScrollAtivo, scrollSpeed]);

  const cifraTransposta = useMemo(() => {
    return transporCifra(musica?.cifra ?? "", transposition);
  }, [musica?.cifra, transposition]);

  const tomExibido = useMemo(() => {
    if (!musica?.tom) return "";

    const tomNormalizado = normalizarTom(musica.tom);
    const index = TOMS.indexOf(tomNormalizado);

    if (index === -1) return musica.tom;

    let novoIndex = (index + transposition) % TOMS.length;
    if (novoIndex < 0) novoIndex += TOMS.length;

    return TOMS[novoIndex];
  }, [musica?.tom, transposition]);

  function aumentarFonte() {
    setFontSize((prev) => Math.min(prev + 2, 32));
  }

  function diminuirFonte() {
    setFontSize((prev) => Math.max(prev - 2, 12));
  }

  function subirTom() {
    setTransposition((prev) => prev + 1);
  }

  function descerTom() {
    setTransposition((prev) => prev - 1);
  }

  function alternarAutoScroll() {
    setAutoScrollAtivo((prev) => !prev);
  }

  function aumentarVelocidade() {
    setScrollSpeed((prev) => Math.min(prev + 0.5, 6));
  }

  function diminuirVelocidade() {
    setScrollSpeed((prev) => Math.max(prev - 0.5, 0.5));
  }

  return (
    <ScreenContainer>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : !musica ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Música não encontrada.</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          onScroll={(event) => {
            currentOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{musica.titulo}</Text>

            {!!musica.artista && (
              <Text style={styles.subtitle}>{musica.artista}</Text>
            )}

            {!!musica.tom && (
              <Text style={styles.tom}>Tom atual: {tomExibido}</Text>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Tom</Text>
            <View style={styles.row}>
              <Pressable style={styles.smallButton} onPress={descerTom}>
                <Text style={styles.smallButtonText}>-1</Text>
              </Pressable>

              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{tomExibido || "--"}</Text>
              </View>

              <Pressable style={styles.smallButton} onPress={subirTom}>
                <Text style={styles.smallButtonText}>+1</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Fonte</Text>
            <View style={styles.row}>
              <Pressable style={styles.smallButton} onPress={diminuirFonte}>
                <Text style={styles.smallButtonText}>A-</Text>
              </Pressable>

              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{fontSize}px</Text>
              </View>

              <Pressable style={styles.smallButton} onPress={aumentarFonte}>
                <Text style={styles.smallButtonText}>A+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Auto scroll</Text>
            <View style={styles.row}>
              <Pressable style={styles.smallButton} onPress={diminuirVelocidade}>
                <Text style={styles.smallButtonText}>- Vel.</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.autoScrollButton,
                  autoScrollAtivo && styles.autoScrollButtonActive,
                ]}
                onPress={alternarAutoScroll}
              >
                <Text style={styles.autoScrollButtonText}>
                  {autoScrollAtivo ? "Parar" : "Iniciar"}
                </Text>
              </Pressable>

              <Pressable style={styles.smallButton} onPress={aumentarVelocidade}>
                <Text style={styles.smallButtonText}>+ Vel.</Text>
              </Pressable>
            </View>

            <Text style={styles.speedText}>
              Velocidade: {scrollSpeed.toFixed(1)}
            </Text>
          </View>

          <View style={styles.cifraCard}>
            <Text style={[styles.cifraText, { fontSize }]}>
              {cifraTransposta || "Sem cifra cadastrada."}
            </Text>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  container: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 6,
  },
  tom: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  panel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  smallButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  smallButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  valueBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  valueText: {
    color: colors.text,
    fontWeight: "700",
  },
  autoScrollButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  autoScrollButtonActive: {
    opacity: 0.85,
  },
  autoScrollButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
  speedText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  cifraCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  cifraText: {
    color: colors.text,
    lineHeight: 30,
  },
});