import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#FFB84D" />
        <Text style={styles.title}>Match not found</Text>
        <Text style={styles.subtitle}>This match doesn&apos;t exist or has been removed</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Matches</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#0A0A0A',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: '#FFFFFF',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFB84D',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: "#0A0A0A",
  },
});
