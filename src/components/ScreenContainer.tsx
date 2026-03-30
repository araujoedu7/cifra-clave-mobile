import { ReactNode } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { colors } from "@/src/constants/colors";

type Props = {
  children: ReactNode;
};

export default function ScreenContainer({ children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
});