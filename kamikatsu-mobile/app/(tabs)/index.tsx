import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const points = useAppStore((state) => state.points);
  const setUser = useAppStore((state) => state.setUser);

  const handleLogout = () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
    >
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLogoText}>Kamikatsu®</Text>
          <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="log-out-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.heroTitleContainer}>
          <Text style={styles.heroTitle}>Master</Text>
          <Text style={styles.heroTitle}>Zero</Text>
          <Text style={styles.heroTitle}>Waste.</Text>
        </View>

        {/* Giant Graphic Letter */}
        <View style={styles.heroGraphicContainer}>
          <Text style={styles.heroGraphicText}>K</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionHeadline}>
          Scan or search your item, and we'll tell you exactly how to dispose of it.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Categories</Text>
            <Text style={styles.statValue}>43</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rate</Text>
            <Text style={styles.statValue}>80%</Text>
          </View>
          <View style={[styles.statBox, { borderColor: Colors.primaryLight + '50', backgroundColor: Colors.primarySurface }]}>
            <Text style={[styles.statLabel, { color: Colors.primary }]}>Points</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{points}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryActionCard} 
          activeOpacity={0.8}
          onPress={() => router.push('/search')}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardTitle}>Search Items</Text>
            <Text style={styles.actionCardSub}>Type any item name to find its bin</Text>
          </View>
          <View style={styles.actionCardIcon}>
            <Ionicons name="search" size={24} color={Colors.primaryLight} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryActionCard, { backgroundColor: Colors.primary }]} 
          activeOpacity={0.8}
          onPress={() => router.push('/scan')}
        >
          <View style={styles.actionCardContent}>
            <Text style={[styles.actionCardTitle, { color: Colors.surface }]}>Scan QR Code</Text>
            <Text style={[styles.actionCardSub, { color: Colors.primarySurface }]}>Scan physical bin codes at the station</Text>
          </View>
          <View style={[styles.actionCardIcon, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="qr-code" size={24} color={Colors.primary} />
          </View>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    backgroundColor: Colors.primaryLight,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  heroLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  heroTitleContainer: {
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 64,
    letterSpacing: -2,
  },
  heroGraphicContainer: {
    position: 'absolute',
    right: -40,
    bottom: -60,
    opacity: 0.2,
    zIndex: 1,
  },
  heroGraphicText: {
    fontSize: 280,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 300,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionHeadline: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.ink,
    lineHeight: 28,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EBE9E1',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#DCD8CC',
  },
  statLabel: {
    fontSize: 13,
    color: Colors.inkSoft,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.ink,
  },
  primaryActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  actionCardSub: {
    fontSize: 15,
    color: Colors.inkSoft,
    lineHeight: 20,
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
});
