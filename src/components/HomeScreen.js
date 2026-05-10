import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticate, checkBiometrics } from '../utils/biometrics';
import { startShakeDetection, stopShakeDetection } from '../utils/accelerometer';

export default function HomeScreen({ onLock }) {
  const [bioActive, setBioActive]   = useState(false);
  const [shakeOn, setShakeOn]       = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biométrie');
  const [biometricIcon, setBiometricIcon] = useState('🔐');
  const shakeRef                    = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { available, type } = await checkBiometrics();
      if (available) {
        if (type === 'FaceID') {
          setBiometricLabel('FaceID');
          setBiometricIcon('🎭');
        } else if (type === 'TouchID' || type === 'Biometrics') {
          setBiometricLabel('TouchID');
          setBiometricIcon('👆');
        }
      }
    };
    init();
    return () => stopShakeDetection();
  }, []);

  // ── Biométrie ──────────────────────────────────────────────────────────────
  const testBio = async () => {
    setBioActive(true);
    const { success } = await authenticate(`Confirmer avec ${biometricLabel}`);
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
        testBio();
      }, 15);
      Alert.alert('Activé', 'Secouez pour lancer la vérification biométrique.');
    }
  };

  const cards = [
    {
      icon: biometricIcon,
      label: biometricLabel,
      sub: biometricLabel === 'FaceID' ? "Tester l'accès via Face ID" : `Tester l'accès via ${biometricLabel}`,
      color: biometricLabel === 'FaceID' ? '#007aff' : '#4f46e5',
      action: testBio,
      on: bioActive,
    },
    {
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

      {cards.map(({ icon, label, sub, color, action, on }) => (
        <TouchableOpacity key={label} style={[s.card, { borderLeftColor: color }]} onPress={action}>
          <View style={[s.cardIcon, { backgroundColor: color + '22' }]}>
            <Text style={{ fontSize: 26 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>{label}</Text>
            <Text style={s.cardSub}>{sub}</Text>
          </View>
          <View style={[s.badge, on && { backgroundColor: color }]}>
            <Text style={s.badgeText}>{on ? 'ON' : 'OFF'}</Text>
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
  root:     { flex: 1, backgroundColor: '#0d0d1a', padding: 20 },
  title:    { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 10 },
  sub:      { color: '#555', fontSize: 13, marginBottom: 24 },
  card:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161625', borderRadius: 16, padding: 18, marginBottom: 14, borderLeftWidth: 4, elevation: 4 },
  cardIcon: { width: 50, height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardLabel:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  cardSub:  { color: '#666', fontSize: 12, marginTop: 2 },
  badge:    { backgroundColor: '#2a2a3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  lockBtn:  { marginTop: 10, backgroundColor: '#1c1c2e', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e' },
});