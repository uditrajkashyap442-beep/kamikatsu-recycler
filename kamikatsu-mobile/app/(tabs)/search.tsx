import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { searchProducts, SearchResultDto } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getStationNumber } from '@/lib/utils';

export default function SearchScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'text' | 'scan'>('text');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const localDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const aiDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const recentSearches = useAppStore((state) => state.recentSearches);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);

  useEffect(() => {
    import('@/lib/api').then(({ cancelPendingSearch }) => {
      cancelPendingSearch();
    });

    if (localDebounceTimer.current) clearTimeout(localDebounceTimer.current);
    if (aiDebounceTimer.current) clearTimeout(aiDebounceTimer.current);

    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    if (query.trim().length < 3) {
      return; // Wait for at least 3 characters before hitting the API
    }

    setLoading(true);
    setAiLoading(false);

    // 1. Instant Local Search (250ms debounce)
    localDebounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchProducts(query, false);
        setResults(data);
        setLoading(false);

        // 2. If no local results, schedule the deep AI Search (1500ms pause)
        if (data.length === 0) {
          aiDebounceTimer.current = setTimeout(async () => {
            setAiLoading(true);
            try {
              const aiData = await searchProducts(query, true);
              setResults(aiData);
            } catch (e) {
              // Handle cancelled requests
            } finally {
              setAiLoading(false);
            }
          }, 1500);
        }
      } catch (e) {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (localDebounceTimer.current) clearTimeout(localDebounceTimer.current);
      if (aiDebounceTimer.current) clearTimeout(aiDebounceTimer.current);
    };
  }, [query]);

  const handleResultPress = (result: SearchResultDto) => {
    addRecentSearch(query);
    if (result.id !== null && result.id !== undefined) {
      router.push(`/product/${result.id}`);
    } else if (result.categoryCode) {
      router.push(`/category/${result.categoryCode}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
  };

  return (
    <View style={styles.container}>
      {/* Top Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, mode === 'text' && styles.toggleBtnActive]}
          onPress={() => setMode('text')}
        >
          <Ionicons name="text-outline" size={18} color={mode === 'text' ? Colors.surface : Colors.inkSoft} />
          <Text style={[styles.toggleText, mode === 'text' && styles.toggleTextActive]}>AI Text Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleBtn, mode === 'scan' && styles.toggleBtnActive]}
          onPress={() => {
            setMode('scan');
            router.push('/scan');
            // Revert back immediately so when they return it's on text
            setTimeout(() => setMode('text'), 500);
          }}
        >
          <Ionicons name="barcode-outline" size={18} color={mode === 'scan' ? Colors.surface : Colors.inkSoft} />
          <Text style={[styles.toggleText, mode === 'scan' && styles.toggleTextActive]}>QR / Barcode Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.inkSoft} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items... (e.g. plastc)"
          placeholderTextColor={Colors.inkSoft}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {query.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <View style={styles.tagContainer}>
                  {recentSearches.map((search, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.tag}
                      onPress={() => handleQuickSearch(search)}
                    >
                      <Text style={styles.tagText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quick Search Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Items</Text>
              {[
                'Plastic bottles',
                'Cardboard',
                'Glass bottles',
                'Aluminum cans',
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionButton}
                  onPress={() => handleQuickSearch(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.resultsCount}>
                  Found {results.length} items
                </Text>
                {results.map((result, idx) => (
                  <TouchableOpacity
                    key={`res-${idx}-${result.id || 'virtual'}`}
                    style={styles.resultCard}
                    onPress={() => handleResultPress(result)}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName}>{result.name}</Text>
                      <Text style={styles.resultCategory}>
                        {result.categoryName} • {result.mainTypeName}
                      </Text>
                      {result.categoryCode && (
                        <View style={styles.searchBinBadge}>
                          <Ionicons name="location-outline" size={11} color={Colors.primary} />
                          <Text style={styles.searchBinText}>Bin Section #{getStationNumber(result.categoryCode)}</Text>
                        </View>
                      )}
                      <Text style={styles.resultDescription} numberOfLines={2}>
                        {result.description}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No Results or AI Searching */}
            {!loading && results.length === 0 && (
              <View style={styles.emptyState}>
                {aiLoading ? (
                  <>
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>AI is searching...</Text>
                    <Text style={styles.emptySubtitle}>Scouring the web and database for "{query}"</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search-outline" size={48} color={Colors.inkSoft} style={{marginBottom: 16}} />
                    <Text style={styles.emptyTitle}>No items found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try searching for different keywords
                    </Text>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: 60,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusPill,
    padding: 4,
    ...Shadow.light,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.borderRadiusPill,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.inkSoft,
  },
  toggleTextActive: {
    color: Colors.surface,
  },
  searchBar: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusPill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    ...Shadow.light,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.ink,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.borderRadiusPill,
  },
  tagText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.borderRadiusLarge,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.light,
  },
  suggestionText: {
    fontSize: 16,
    color: Colors.ink,
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.inkSoft,
    marginBottom: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadow.light,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  resultCategory: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginBottom: Spacing.xs,
  },
  resultDescription: {
    fontSize: 12,
    color: Colors.inkSoft,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.inkSoft,
    textAlign: 'center',
  },
  searchBinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.borderRadiusPill,
    gap: 4,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EBE9E1',
  },
  searchBinText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ink,
  },
});
