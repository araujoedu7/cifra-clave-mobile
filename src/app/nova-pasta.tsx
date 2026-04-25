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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function NovaPastaScreen() {
  const { appUser } = useAuth();
  const alert = useAlert();

  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreatePasta() {
    if (!nome.trim()) {
      alert.showAlert({
        title: "Erro",
        message: "Digite o nome da pasta.",
      });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "pastas"), {
        nome: nome.trim(),
        createdBy: appUser?.uid,
        createdAt: serverTimestamp(),
      });

      alert.showAlert({
        title: "Sucesso",
        message: "Pasta criada com sucesso!",
      });
      router.back();
    } catch (error: any) {
      console.log(error);
      alert.showAlert({
        title: "Erro",
        message: "Não foi possível criar a pasta.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Nova pasta</Text>

        <TextInput
          placeholder="Nome da pasta"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
            loading && { opacity: 0.6 },
          ]}
          onPress={handleCreatePasta}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Criando..." : "Criar pasta"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});