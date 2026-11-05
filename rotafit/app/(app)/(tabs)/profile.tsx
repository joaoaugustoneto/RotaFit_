import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ThemePicker } from '@/components/ThemePicker';
import { useAuth } from '@/context/AuthContext';
import { useSpotify } from '@/context/SpotifyContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { spacing, useTheme } from '@/theme';
import { showAlert } from '@/utils/alert';
import { friendlyError } from '@/utils/errors';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { tokens, connect, disconnect, connecting } = useSpotify();
  const { preferences, updatePreferences } = useUserPreferences();
  const name = String(user?.user_metadata?.full_name ?? 'Usuário');
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  function confirmSignOut() {
    showAlert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut().catch((e) => showAlert('Erro', friendlyError(e))),
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.screen,
        { maxWidth: 540, width: '100%', alignSelf: 'center' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text, marginTop: spacing.xl }]}>
        Perfil
      </Text>
      <Card style={styles.card}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.onPrimary }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.email, { color: theme.muted }]}>{user?.email}</Text>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>APARÊNCIA</Text>
      <ThemePicker />

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>METAS E CORPO</Text>
      <Card style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Peso</Text>
            <Text style={[styles.settingDesc, { color: theme.muted }]}>
              Para cálculo preciso de calorias
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diminuir peso"
              onPress={() =>
                updatePreferences({
                  weightKg: Math.max(30, preferences.weightKg - 1),
                })
              }
              style={[
                styles.stepperBtn,
                { backgroundColor: theme.primarySoft },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
              ]}
            >
              <Ionicons name="remove" size={18} color={theme.primary} />
            </Pressable>
            <Text style={[styles.stepperValue, { color: theme.text }]}>
              {preferences.weightKg} kg
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar peso"
              onPress={() =>
                updatePreferences({
                  weightKg: Math.min(250, preferences.weightKg + 1),
                })
              }
              style={[
                styles.stepperBtn,
                { backgroundColor: theme.primarySoft },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
              ]}
            >
              <Ionicons name="add" size={18} color={theme.primary} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Meta semanal</Text>
            <Text style={[styles.settingDesc, { color: theme.muted }]}>
              Objetivo de corrida da semana
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diminuir meta semanal"
              onPress={() =>
                updatePreferences({
                  weeklyGoalKm: Math.max(5, preferences.weeklyGoalKm - 5),
                })
              }
              style={[
                styles.stepperBtn,
                { backgroundColor: theme.primarySoft },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
              ]}
            >
              <Ionicons name="remove" size={18} color={theme.primary} />
            </Pressable>
            <Text style={[styles.stepperValue, { color: theme.text }]}>
              {preferences.weeklyGoalKm} km
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar meta semanal"
              onPress={() =>
                updatePreferences({
                  weeklyGoalKm: Math.min(200, preferences.weeklyGoalKm + 5),
                })
              }
              style={[
                styles.stepperBtn,
                { backgroundColor: theme.primarySoft },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined,
              ]}
            >
              <Ionicons name="add" size={18} color={theme.primary} />
            </Pressable>
          </View>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>SPOTIFY</Text>
      <Card style={styles.card}>
        {tokens ? (
          <>
            <Text style={{ color: theme.text, marginBottom: spacing.sm }}>
              Conta conectada.
            </Text>
            <Button title="Desconectar Spotify" variant="ghost" onPress={disconnect} />
          </>
        ) : (
          <Button
            title={connecting ? 'Conectando...' : 'Conectar Spotify'}
            onPress={connect}
            disabled={connecting}
          />
        )}
      </Card>

      <Button
        title="Sair da conta"
        variant="danger"
        onPress={confirmSignOut}
        style={styles.signOut}
      />
      <Text style={[styles.version, { color: theme.muted }]}>
        RotaFit v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  card: { alignItems: 'center', gap: 2 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 30, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  settingsCard: { gap: spacing.md, paddingVertical: spacing.md },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: 15, fontWeight: '700' },
  settingDesc: { fontSize: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 15, fontWeight: '800', minWidth: 58, textAlign: 'center' },
  divider: { height: 1, width: '100%' },
  signOut: { marginTop: spacing.md },
  version: { textAlign: 'center', fontSize: 12, marginTop: spacing.sm },
});
