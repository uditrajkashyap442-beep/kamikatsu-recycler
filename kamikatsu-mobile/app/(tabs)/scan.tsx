import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import api, { getProductByBarcode, logQrScan } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchActive, setTorchActive] = useState(false);
  const isScanning = useRef(true);
  const isFocused = useIsFocused();
  
  const addPoints = useAppStore((state) => state.addPoints);
  const sessionId = useAppStore((state) => state.sessionId);

  useEffect(() => {
    if (!isFocused) {
      setTorchActive(false);
    }
  }, [isFocused]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={Colors.ink} style={{ marginBottom: Spacing.md }} />
        <Text style={styles.title}>Camera Access Needed</Text>
        <Text style={styles.message}>
          We need permission to access your camera to scan station QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!isScanning.current) return;
    isScanning.current = false;
    
    const normalizedData = data.trim();
    
    // Check if it's a QR code for a category
    if (normalizedData.includes('kamikatsu-zero.jp/category/')) {
      const parts = normalizedData.split('/');
      const code = parts[parts.length - 1].split('?')[0].trim();
      
      // Award Chiri-tsumo points for depositing waste at the station
      addPoints(10);
      
      // Log category QR scan in backend database
      logQrScan(null, code, sessionId).catch((e: any) => console.error("Category QR Log failed", e));
      
      Alert.alert('Chiri-Tsumo Points! ♻️', 'You earned +10 points for sorting and depositing your waste!', [
        { 
          text: 'OK', 
          onPress: () => {
            router.push(`/category/${code}`);
            setTimeout(() => { isScanning.current = true; }, 1500);
          } 
        }
      ]);
      return;
    } 
    
    // Treat as hardware barcode (JAN/EAN/UPC)
    try {
      const product = await getProductByBarcode(data);
      if (product && product.category) {
        if (product.id) {
          logQrScan(product.id, null, sessionId).catch((e: any) => console.error("QR Log failed", e));
        }
        // Direct to Category page as requested by user, passing product name to display details contextually
        router.push(`/category/${product.category.code}?scannedProduct=${encodeURIComponent(product.name)}`);
        setTimeout(() => { isScanning.current = true; }, 1500);
      } else {
        Alert.alert('Not Found', 'This barcode is not registered in the zero-waste database.', [
          { text: 'OK', onPress: () => { isScanning.current = true; } }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch barcode data.', [
        { text: 'OK', onPress: () => { isScanning.current = true; } }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'upc_a', 'upc_e'],
        }}
        enableTorch={torchActive && isFocused}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleOverlay}>
            <View style={styles.sideOverlay} />
            
            {/* Viewfinder Frame */}
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Scan the QR code at the waste station
            </Text>
            <TouchableOpacity
              style={styles.torchButton}
              onPress={() => setTorchActive(!torchActive)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={torchActive ? 'flash' : 'flash-off'} 
                size={24} 
                color={Colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const overlayColor = 'rgba(17, 27, 20, 0.6)'; // ink color with opacity

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 15,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.borderRadiusLarge,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  middleOverlay: {
    flexDirection: 'row',
    height: SCAN_FRAME_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primaryLight,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 16,
  },
  instructionText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.xl,
  },
  torchButton: {
    marginTop: 40,
    backgroundColor: Colors.primarySurface,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
