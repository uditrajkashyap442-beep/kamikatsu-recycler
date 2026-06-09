import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const { registerUser } = await import('@/lib/api');
      const response = await registerUser({ name, email, password });
      setUser({
        id: response.id.toString(),
        email: response.email,
        name: response.name,
        points: response.points,
        token: response.token,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      let errorMessage = 'Failed to register. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the zero-waste movement.</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.inkSoft} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={Colors.inkSoft}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.inkSoft} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.inkSoft}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.inkSoft} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.inkSoft}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.inkSoft,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#EBE9E1',
    borderRadius: Radius.borderRadiusLarge,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.ink,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.borderRadiusPill,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBE0',
    padding: Spacing.md,
    borderRadius: Radius.borderRadiusLarge,
    gap: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: Colors.inkSoft,
    fontSize: 15,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
