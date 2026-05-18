import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticate, checkBiometrics } from '../utils/biometrics';
import { startShakeDetection, stopShakeDetection } from '../utils/accelerometer';

export default function HomeScreen({ onLock }) {
  const [bioActive, setBioActive]   = useState(false);
  const [shakeOn, setShakeOn]       = useState(false);
  const [biometrics, setBiometrics] = useState({ faceId: false, touchId: false });
  const shakeRef                    = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { available, type } = await checkBiometrics();
      if (available) {
        setBiometrics({
          faceId: type === 'FaceID',
          touchId: type === 'TouchID' || type === 'Biometrics',
        });
      }
    };
    init();
    return () => stopShakeDetection();
  }, []);

  // ── Biométrie ──────────────────────────────────────────────────────────────
  const testBio = async (typeLabel) => {
    setBioActive(typeLabel);
    const { success } = await authenticate(`Confirmer avec ${typeLabel}`);
    setBioActive(false);
    Alert.alert(success ? '✅ Authentifié' : '❌ Échec');
  };

  // ── Détection secousse ───────────────────────────────────────────────────────
  const toggleShake = () => {
    if (shakeOn) {
      stopShakeDetection(); setShakeOn(false); shakeRef.current = false;
    } else {
      shakeRef.current = true; setShakeOn(true);
      startShakeDetection(() => {
        if (!shakeRef.current) return;
        console.log('Secousse détectée sur HomeScreen !');
        testBio('Secousse');
      }, 15);
      Alert.alert('Activé', 'Secouez pour lancer la vérification biométrique.');
    }
  };

  const cards = [
    {
      id: 'faceid',
      icon: '🎭',
      label: 'Face ID',
      sub: biometrics.faceId ? "Tester l'accès via Face ID" : "Face ID non disponible",
      color: '#007aff',
      action: () => biometrics.faceId && testBio('Face ID'),
      on: bioActive === 'Face ID',
      disabled: !biometrics.faceId
    },
    {
      id: 'touchid',
      icon: '👆',
      label: 'Empreinte',
      sub: biometrics.touchId ? "Tester l'accès via Empreinte" : "Empreinte non disponible",
      color: '#4f46e5',
      action: () => biometrics.touchId && testBio('Empreinte'),
      on: bioActive === 'Empreinte',
      disabled: !biometrics.touchId
    },
    {
      id: 'shake',
      icon: '📳',
      label: shakeOn ? 'Secousse: Active' : 'Secousse: Prête',
      sub: 'Secouez pour authentifier',
      color: shakeOn ? '#22c55e' : '#f97316',
      action: toggleShake,
      on: shakeOn,
    },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <Text style={s.title}>BiometryLock</Text>
      <Text style={s.sub}>Tableau de bord</Text>

      {cards.map(({ id, icon, label, sub, color, action, on, disabled }) => (
        <TouchableOpacity 
          key={id} 
          style={[s.card, { borderLeftColor: color }, disabled && s.cardDisabled]} 
          onPress={action}
          disabled={disabled}
        >
          <View style={[s.cardIcon, { backgroundColor: color + '22' }]}>
            <Text style={[{ fontSize: 26 }, disabled && { opacity: 0.3 }]}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.cardLabel, disabled && s.textDisabled]}>{label}</Text>
            <Text style={[s.cardSub, disabled && s.textDisabled]}>{sub}</Text>
          </View>
          <View style={[s.badge, on && { backgroundColor: color }, disabled && { backgroundColor: '#333' }]}>
            <Text style={s.badgeText}>{disabled ? 'N/A' : (on ? 'ON' : 'OFF')}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={s.lockBtn} onPress={onLock}>
        <Text style={{ color: '#aaa', fontWeight: '700' }}>🔒  Verrouiller</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0d0d1a', paddingHorizontal: 24, paddingTop: 20 },
  title:       { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  sub:         { color: '#555', fontSize: 14, fontWeight: '600', marginBottom: 32 },
  card:        { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#161625', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16, 
    borderLeftWidth: 5 
  },
  cardDisabled:{ opacity: 0.5, borderLeftColor: '#333' },
  cardIcon:    { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardLabel:   { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 2 },
  cardSub:     { color: '#888', fontSize: 13 },
  textDisabled:{ color: '#555' },
  badge:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#2a2a3e' },
  badgeText:   { color: '#fff', fontSize: 11, fontWeight: '800' },
  lockBtn:     { marginTop: 'auto', marginBottom: 24, alignSelf: 'center', padding: 12 },
});