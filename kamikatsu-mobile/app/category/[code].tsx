import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { getCategoryByCode, CategoryDto, getProductsByCategoryCode, ProductDto } from '@/lib/api';
import { getStationNumber } from '@/lib/utils';

export default function CategoryDetailsScreen() {
  const { code, scannedProduct } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function loadCategory() {
      try {
        const data = await getCategoryByCode(code as string);
        setCategory(data);
        if (data) {
          setLoadingProducts(true);
          // Query products that belong to this category precisely via its code
          const results = await getProductsByCategoryCode(code as string);
          setProducts(results);
        }
      } finally {
        setLoading(false);
        setLoadingProducts(false);
      }
    }
    if (code) {
      loadCategory();
    }
  }, [code]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Category not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { mainType } = category;
  const headerColor = mainType.colorHex || Colors.primary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }} bounces={false} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={[styles.headerBanner, { backgroundColor: headerColor }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={headerColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.mainTypeName}>{mainType.name}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
          <View style={styles.codeBadge}>
            <Text style={[styles.codeBadgeText, { color: headerColor }]}>{category.code}</Text>
          </View>
        </View>
      </View>

      {scannedProduct && (
        <View style={styles.scannedBanner}>
          <View style={styles.scannedHeaderRow}>
            <Ionicons name="scan-circle" size={24} color={Colors.primary} />
            <Text style={styles.scannedTitle}>Scanned Item</Text>
          </View>
          <Text style={styles.scannedValue}>{decodeURIComponent(scannedProduct as string)}</Text>
          <Text style={styles.scannedInstruction}>
            Dispose of this item in the category bin shown below.
          </Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.contentSection}>
        <Text style={styles.descriptionText}>{category.description}</Text>

        {/* Disposal Method Card */}
        <View style={styles.methodCard}>
          <View style={[styles.methodIconBox, { backgroundColor: headerColor + '15' }]}>
            <Ionicons name="trash-bin" size={22} color={headerColor} />
          </View>
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>Disposal Method</Text>
            <Text style={styles.methodText}>{category.disposalMethod}</Text>
          </View>
        </View>

        {/* Bin Location Card */}
        <View style={[styles.binLocationCard, { marginTop: Spacing.lg }]}>
          <View style={[styles.binNumberPill, { backgroundColor: headerColor }]}>
            <Text style={styles.binNumberText}>#{getStationNumber(category.code)}</Text>
          </View>
          <View style={styles.binLocationInfo}>
            <Text style={styles.binLocationTitle}>Garage Station Section</Text>
            <Text style={styles.binLocationSub}>
              Proceed to Section #{getStationNumber(category.code)} in the Kamikatsu Garage facility.
            </Text>
          </View>
        </View>

        {/* QR Code Payload Tag */}
        <View style={styles.qrPayloadCard}>
          <Ionicons name="qr-code-outline" size={16} color={Colors.inkSoft} />
          <Text style={styles.qrPayloadText}>QR Target: https://kamikatsu-zero.jp/category/{category.code}</Text>
        </View>
      </View>

      {/* Products list under this category */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Registered Items</Text>
        {loadingProducts ? (
          <ActivityIndicator size="small" color={headerColor} style={{ marginTop: Spacing.md }} />
        ) : products.length > 0 ? (
          <View style={styles.productsList}>
            {products.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.productIconCircle, { backgroundColor: headerColor + '10' }]}>
                  <Ionicons name="leaf-outline" size={18} color={headerColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productCardName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.productCardDesc} numberOfLines={1}>{item.description}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.inkSoft} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyProductsCard}>
            <Ionicons name="cube-outline" size={24} color={Colors.inkSoft} style={{ marginBottom: 6 }} />
            <Text style={styles.emptyProductsText}>No specific items registered under this category yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    padding: Spacing.lg,
  },
  headerBanner: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTopRow: {
    marginBottom: Spacing.xl,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  mainTypeName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.surface,
    opacity: 0.85,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  categoryName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.surface,
    lineHeight: 38,
    marginBottom: Spacing.md,
  },
  codeBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.borderRadiusPill,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  codeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  contentSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.ink,
    lineHeight: 24,
    marginBottom: Spacing.xl,
    fontWeight: '500',
  },
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  methodText: {
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 22,
    fontWeight: '500',
  },
  productsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  productsList: {
    gap: Spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.borderRadiusLarge,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    gap: Spacing.md,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  productIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  productCardDesc: {
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  emptyProductsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE9E1',
    borderStyle: 'dashed',
  },
  emptyProductsText: {
    fontSize: 13,
    color: Colors.inkSoft,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.ink,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.borderRadiusPill,
  },
  backBtnText: {
    color: Colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  binLocationCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  binNumberPill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  binNumberText: {
    color: Colors.surface,
    fontSize: 22,
    fontWeight: '900',
  },
  binLocationInfo: {
    flex: 1,
  },
  binLocationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  binLocationSub: {
    fontSize: 12,
    color: Colors.inkSoft,
    lineHeight: 16,
    fontWeight: '500',
  },
  qrPayloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.borderRadiusLarge,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    borderStyle: 'dashed',
    gap: 8,
    marginTop: Spacing.md,
  },
  qrPayloadText: {
    fontSize: 12,
    color: Colors.inkSoft,
    fontWeight: '600',
  },
  scannedBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1.5,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scannedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scannedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scannedValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  scannedInstruction: {
    fontSize: 12,
    color: Colors.inkSoft,
    fontWeight: '500',
  },
});
