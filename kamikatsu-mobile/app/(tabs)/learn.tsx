import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useState } from 'react';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FactItem {
  id: number;
  icon: string;
  title: string;
  shortDesc: string;
  longDesc: string;
}

export default function LearnScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const facts: FactItem[] = [
    {
      id: 1,
      icon: 'list-outline',
      title: '45 Sorting Categories',
      shortDesc: 'Residents separate waste into 45 different subcategories.',
      longDesc: 'From different types of paper (newspapers, flyers, cardboard) to various plastics and metals, Kamikatsu sorted waste across 43 categories, recently expanded to 45, ensuring that almost everything is recycled rather than incinerated.',
    },
    {
      id: 2,
      icon: 'trending-up-outline',
      title: '80%+ Recycling Rate',
      shortDesc: 'One of the highest recycling rates in the world.',
      longDesc: 'While the national recycling rate in Japan is around 20%, Kamikatsu achieves over 80%. The remaining 20% consists of items that cannot be safely recycled and must be incinerated.',
    },
    {
      id: 3,
      icon: 'bicycle-outline',
      title: 'No Trash Collection Trucks',
      shortDesc: 'Residents bring waste directly to the station.',
      longDesc: 'There are no garbage collection trucks in Kamikatsu. Instead, residents bring their pre-sorted waste directly to the Hibigatani Waste Station. This promotes personal accountability and saves significant municipality carbon emissions.',
    },
    {
      id: 4,
      icon: 'sync-outline',
      title: 'The Kurukuru Reuse Shop',
      shortDesc: 'A community shop where everything is free.',
      longDesc: 'Located at the Zero Waste Center, the Kurukuru shop allows residents to drop off unwanted but reusable items like clothes, toys, and tableware. Anyone can take these items home for free. Over 15 tons of items find new homes here annually!',
    },
    {
      id: 5,
      icon: 'document-text-outline',
      title: 'Zero Waste Declaration',
      shortDesc: 'Japan’s first official zero-waste commitment.',
      longDesc: 'In 2003, Kamikatsu became the first municipality in Japan to issue a Zero Waste Declaration, committing to eliminating waste entirely without relying on landfill or mass incineration.',
    },
    {
      id: 6,
      icon: 'leaf-outline',
      title: '100% Food Scraps Composting',
      shortDesc: 'Organic waste is composted entirely at home.',
      longDesc: 'Food scraps make up a large portion of municipal waste. In Kamikatsu, 100% of organic waste is composted at home. The town provides subsidies for electric composters, ensuring no wet food waste enters the waste stream.',
    },
    {
      id: 7,
      icon: 'help-circle-outline',
      title: 'The Question Mark Center',
      shortDesc: 'A building shaped like a question mark (?).',
      longDesc: 'The Kamikatsu Zero Waste Center, called "WHY", is built in the shape of a question mark to ask: "Why do we produce waste?". The structure is made from local cedar wood and features windows and doors salvaged from abandoned houses.',
    },
    {
      id: 8,
      icon: 'gift-outline',
      title: 'Chiri-tsumo Point System',
      shortDesc: 'Earn points and redeem prizes by recycling.',
      longDesc: 'Sorters earn "Chiri-tsumo" points (derived from the proverb meaning "even dust piled up becomes a mountain") for bringing in recyclable items. These points can be redeemed for environmentally friendly household goods.',
    },
    {
      id: 9,
      icon: 'globe-outline',
      title: 'Global Inspiration Model',
      shortDesc: 'A benchmark for circular economy worldwide.',
      longDesc: 'Kamikatsu is studied by governments, researchers, and ecological organizations globally. It demonstrates that municipal zero-waste is achievable through citizen engagement, even without expensive high-tech facilities.',
    },
    {
      id: 10,
      icon: 'people-outline',
      title: 'Cooperative Community sorting',
      shortDesc: 'Sorting waste fosters social connection.',
      longDesc: 'At the Hibigatani Station, residents help each other sort and stack complex items. Staff members are always present to assist elderly residents, turning waste disposal into a meaningful social and community bonding activity.',
    }
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Kamikatsu Academy</Text>
        <Text style={styles.headerTitle}>10 Zero-Waste Secrets</Text>
        <Text style={styles.headerSubtitle}>
          Tap any secret to discover how this small Japanese town transformed waste into a resource.
        </Text>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {facts.map((fact, index) => {
          const isExpanded = expandedId === fact.id;
          return (
            <TouchableOpacity
              key={fact.id}
              style={[
                styles.factCard,
                isExpanded && styles.factCardExpanded
              ]}
              onPress={() => toggleExpand(fact.id)}
              activeOpacity={0.9}
            >
              {/* Card Title Header */}
              <View style={styles.cardHeader}>
                <View style={[
                  styles.numBadge,
                  isExpanded ? styles.numBadgeActive : styles.numBadgeInactive
                ]}>
                  <Text style={[
                    styles.numBadgeText,
                    isExpanded ? styles.numBadgeTextActive : styles.numBadgeTextInactive
                  ]}>
                    {(index + 1).toString().padStart(2, '0')}
                  </Text>
                </View>

                <View style={styles.titleContainer}>
                  <Text style={[
                    styles.factTitle,
                    isExpanded && styles.factTitleActive
                  ]}>
                    {fact.title}
                  </Text>
                  {!isExpanded && (
                    <Text style={styles.factShortDesc} numberOfLines={1}>
                      {fact.shortDesc}
                    </Text>
                  )}
                </View>

                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={isExpanded ? Colors.primary : Colors.inkSoft} 
                  style={styles.chevron}
                />
              </View>

              {/* Collapsible Details */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  <Text style={styles.longDescText}>
                    {fact.longDesc}
                  </Text>
                  <View style={styles.factMetaRow}>
                    <Ionicons name={fact.icon as any} size={18} color={Colors.primary} />
                    <Text style={styles.factMetaText}>Kamikatsu Environmental Protocol</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 64,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.surface,
    lineHeight: 34,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D8F3DC',
    lineHeight: 20,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  factCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  factCardExpanded: {
    borderColor: Colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numBadgeInactive: {
    backgroundColor: Colors.bg,
  },
  numBadgeActive: {
    backgroundColor: Colors.primary,
  },
  numBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  numBadgeTextInactive: {
    color: Colors.primary,
  },
  numBadgeTextActive: {
    color: Colors.surface,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  factTitleActive: {
    color: Colors.primary,
  },
  factShortDesc: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  expandedContent: {
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE9E1',
    marginBottom: 12,
  },
  longDescText: {
    fontSize: 14,
    color: Colors.inkSoft,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
  },
  factMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  factMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
