import ScreenContainer from "@/src/components/ScreenContainer";
import { colors } from "@/src/constants/colors";
import { useAlert } from "@/src/contexts/AlertContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { db } from "@/src/firebase/config";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput
} from "react-native";

export default function NovaMusicaScreen() {
  const { appUser } = useAuth();
  const alert = useAlert();

  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [tom, setTom] = useState("");
  const [cifra, setCifra] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateMusica() {
    if (!titulo.trim() || !cifra.trim()) {
      alert.showAlert({
        title: "Erro",
        message: "Preencha pelo menos título e cifra.",
      });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "musicas"), {
        titulo: titulo.trim(),
        artista: artista.trim(),
        tom: tom.trim(),
        cifra: cifra.trim(),
        createdBy: appUser?.uid,
        createdAt: serverTimestamp(),
      });

      alert.showAlert({
        title: "Sucesso",
        message: "Música criada com sucesso!",
      });
      router.back();
    } catch (error: any) {
      console.log(error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível criar a música.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nova música</Text>

        <TextInput
          placeholder="Título"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          placeholder="Artista / Ministério"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={artista}
          onChangeText={setArtista}
        />

        <TextInput
          placeholder="Tom (ex: C, D, G)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={tom}
          onChangeText={setTom}
        />

        <TextInput
          placeholder="Cifra da música"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.cifraInput]}
          value={cifra}
          onChangeText={setCifra}
          multiline
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
            loading && { opacity: 0.6 },
          ]}
          onPress={handleCreateMusica}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Salvando..." : "Salvar música"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    marginBottom: 12,
  },
  cifraInput: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});