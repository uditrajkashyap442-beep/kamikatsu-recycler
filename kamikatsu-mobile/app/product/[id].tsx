import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { getProductById, ProductDto } from '@/lib/api';
import { getStationNumber } from '@/lib/utils';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(Number(id));
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Product not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (product.homeOnly) {
    return (
      <View style={styles.fullScreenGreen}>
        <View style={styles.fullScreenIconCircle}>
          <Ionicons name="home-outline" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.fullScreenAlertTitle}>Compost at Home</Text>
        <Text style={styles.fullScreenAlertSubtitle}>Never bring this item to the sorting station.</Text>
        <View style={styles.homeOnlyCard}>
          <Ionicons name="information-circle-outline" size={20} color="#D8F3DC" />
          <Text style={styles.homeOnlyCardText}>
            Residents must dispose of food scraps and organic compost at home. Use your home composting bin.
          </Text>
        </View>
        <TouchableOpacity style={styles.fullScreenBackBtn} onPress={() => router.back()}>
          <Text style={styles.fullScreenBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { category } = product;
  const { mainType } = category;
  const mainColor = mainType.colorHex || Colors.primary;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Floating Header Back Button */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        {/* Product Hero Banner */}
        {product.imageUrl ? (
          <View style={styles.heroContainer}>
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
            <View style={styles.imageOverlay} />
          </View>
        ) : (
          <View style={[styles.gradientHeader, { backgroundColor: mainColor + '10' }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: mainColor + '20' }]}>
              <Ionicons name="trash-outline" size={48} color={mainColor} />
            </View>
          </View>
        )}

        {/* Profile Card overlapping Hero */}
        <View style={styles.profileCard}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.productDesc}>{product.description}</Text>
          ) : (
            <Text style={[styles.productDesc, { fontStyle: 'italic', opacity: 0.7 }]}>No description provided.</Text>
          )}
        </View>

        {/* Info Cards Grid (Cost & Classification) */}
        <View style={styles.specsContainer}>
          <View style={styles.specCard}>
            <View style={[styles.specIconContainer, { backgroundColor: product.costStatus === 'free' ? '#D8F3DC' : '#FFEBE0' }]}>
              <Ionicons 
                name={product.costStatus === 'free' ? 'checkmark-circle-outline' : 'cash-outline'} 
                size={22} 
                color={product.costStatus === 'free' ? Colors.success : Colors.error} 
              />
            </View>
            <Text style={styles.specVal}>{product.costStatus === 'free' ? 'Free Disposal' : 'Paid Service'}</Text>
            <Text style={styles.specLbl}>Disposal Cost</Text>
          </View>

          <View style={styles.specCard}>
            <View style={[styles.specIconContainer, { backgroundColor: '#E2EAFC' }]}>
              <Ionicons name="leaf-outline" size={22} color="#3F37C9" />
            </View>
            <Text style={styles.specVal}>{product.classification.charAt(0).toUpperCase() + product.classification.slice(1)}</Text>
            <Text style={styles.specLbl}>Classification</Text>
          </View>
        </View>

        {/* Bin Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bin Location</Text>
          <View style={styles.binLocationCard}>
            <View style={[styles.binNumberPill, { backgroundColor: mainColor }]}>
              <Text style={styles.binNumberText}>#{getStationNumber(category.code)}</Text>
            </View>
            <View style={styles.binLocationInfo}>
              <Text style={styles.binLocationTitle}>Garage Station Section</Text>
              <Text style={styles.binLocationSub}>
                Proceed to Section #{getStationNumber(category.code)} in the Kamikatsu Garage facility.
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Payload Tag */}
        <View style={styles.section}>
          <View style={styles.qrPayloadCard}>
            <Ionicons name="qr-code-outline" size={16} color={Colors.inkSoft} />
            <Text style={styles.qrPayloadText}>QR Target: https://kamikatsu-zero.jp/category/{category.code}</Text>
          </View>
        </View>

        {/* Disposal Guideline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disposal Guideline</Text>
          <TouchableOpacity 
            style={[styles.categoryInfoCard, { borderColor: mainColor }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/category/${category.code}`)}
          >
            <View style={[styles.categoryHeader, { backgroundColor: mainColor }]}>
              <Ionicons name="trash-bin-outline" size={20} color={Colors.surface} />
              <Text style={styles.categoryHeaderTitle}>{category.name} ({category.code})</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.surface} style={{ marginLeft: 'auto' }} />
            </View>
            <View style={styles.categoryBody}>
              <Text style={styles.disposalMethodLabel}>How to Dispose</Text>
              <Text style={styles.disposalMethodText}>{category.disposalMethod || "Clean, separate materials, and deposit in the designated bin at the station."}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Preparation Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation Steps</Text>
          <View style={styles.card}>
            {product.preparationSteps ? (
               product.preparationSteps.split('\n').filter(s => s.trim().length > 0).map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepNumberCircle, { backgroundColor: mainColor + '15' }]}>
                    <Text style={[styles.stepNumberText, { color: mainColor }]}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.trim()}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyStepsContainer}>
                <Ionicons name="checkmark-done" size={28} color={Colors.primary} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyText}>No special preparation needed. Clean and sort normally.</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Overlay Banner for Kurukuru Shop */}
      {product.kurukuruLocation ? (
        <View style={styles.tealOverlayBanner}>
          <View style={styles.tealBannerContent}>
            <View style={styles.tealBannerIconCircle}>
              <Ionicons name="gift-outline" size={20} color="#0D7377" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tealBannerTitle}>Take to Kurukuru shop.</Text>
              <Text style={styles.tealBannerDesc} numberOfLines={1}>Location: {product.kurukuruLocation}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    padding: Spacing.lg,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    zIndex: 100,
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
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginLeft: Spacing.md,
    backgroundColor: Colors.surface + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.borderRadiusPill,
    maxWidth: '70%',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  heroContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  gradientHeader: {
    height: 220,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: -30,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    marginBottom: Spacing.lg,
  },
  productName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    lineHeight: 34,
    marginBottom: 6,
  },
  productDesc: {
    fontSize: 15,
    color: Colors.inkSoft,
    lineHeight: 22,
    fontWeight: '500',
  },
  specsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  specCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  specIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  specLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  categoryInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  categoryHeaderTitle: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  categoryBody: {
    padding: Spacing.md,
  },
  disposalMethodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  disposalMethodText: {
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.borderRadiusLarge,
    padding: Spacing.lg,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBE9E1',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontWeight: '800',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyStepsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
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
  fullScreenGreen: {
    flex: 1,
    backgroundColor: '#1A3D2B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  fullScreenIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  fullScreenAlertTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  fullScreenAlertSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#D8F3DC',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  homeOnlyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginHorizontal: Spacing.md,
  },
  homeOnlyCardText: {
    color: '#D8F3DC',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  fullScreenBackBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.borderRadiusPill,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  fullScreenBackBtnText: {
    color: '#1A3D2B',
    fontWeight: '800',
    fontSize: 16,
  },
  tealOverlayBanner: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#0D7377',
    borderRadius: 20,
    padding: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  tealBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tealBannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tealBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tealBannerDesc: {
    fontSize: 13,
    color: '#D1F2F2',
    marginTop: 2,
    fontWeight: '600',
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
  },
  qrPayloadText: {
    fontSize: 12,
    color: Colors.inkSoft,
    fontWeight: '600',
  },
});
