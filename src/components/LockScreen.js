import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, StyleSheet, Image } from 'react-native';
import { authenticate, checkBiometrics } from '../utils/biometrics';
import { startShakeDetection, stopShakeDetection } from '../utils/accelerometer';
import { getRequiredShakes, getTodayName } from '../utils/shakeCode';

export default function LockScreen({ onUnlock }) {
  const required = getRequiredShakes();
  const [count, setCount]         = useState(0);
  const [shakeOn, setShakeOn]     = useState(false);
  const [biometrics, setBiometrics] = useState({ faceId: false, touchId: false, generic: false });
  const countRef                  = useRef(0);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Vérification des biométries...');
        const { available, type } = await checkBiometrics();
        console.log('Biométrie disponible:', available, 'Type:', type);
        
        if (available) {
          setBiometrics({
            faceId: type === 'FaceID',
            touchId: type === 'TouchID' || type === 'Biometrics',
            generic: type !== 'FaceID' && type !== 'TouchID' && type !== 'Biometrics'
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation biométrique:', error);
      }
    };
    init();

    if (required === 0) {
      console.log('Aucune secousse requise pour aujourd\'hui. Déverrouillage automatique.');
      onUnlock();
    }
    
    return () => stopShakeDetection();
  }, []);

  const biometricUnlock = async (typeLabel) => {
    const { success } = await authenticate(`Déverrouiller avec ${typeLabel}`);
    if (success) {
      onUnlock();
    } else {
      console.log('Authentification annulée ou échouée');
    }
  };

  const toggleShake = () => {
    if (shakeOn) {
      stopShakeDetection(); setShakeOn(false); setCount(0); countRef.current = 0;
    } else {
      setShakeOn(true); setCount(0); countRef.current = 0;
      startShakeDetection(() => {
        countRef.current += 1;
        setCount(countRef.current);
        if (countRef.current >= required) { stopShakeDetection(); onUnlock(); }
      }, 15);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
      <Image source={require('../assets/logo.png')} style={s.logo} resizeMode="contain" />
      <Text style={s.title}>BiometryLock</Text>
      <Text style={s.sub}>Choisissez votre méthode</Text>

      {/* Bouton Face ID */}
      <TouchableOpacity 
        style={[s.btnPrimary, s.btnFaceId, !biometrics.faceId && s.btnDisabled]} 
        onPress={() => biometrics.faceId && biometricUnlock('FaceID')}
        disabled={!biometrics.faceId}
      >
        <Text style={[s.btnText, !biometrics.faceId && s.btnTextDisabled]}>🎭  Face ID</Text>
      </TouchableOpacity>

      {/* Bouton Empreinte */}
      <TouchableOpacity 
        style={[s.btnPrimary, !biometrics.touchId && s.btnDisabled]} 
        onPress={() => biometrics.touchId && biometricUnlock('Empreinte')}
        disabled={!biometrics.touchId}
      >
        <Text style={[s.btnText, !biometrics.touchId && s.btnTextDisabled]}>👆  Empreinte digitale</Text>
      </TouchableOpacity>

      {/* Bouton Secousses */}
      <TouchableOpacity style={[s.btnSecondary, shakeOn && s.btnActive]} onPress={toggleShake}>
        <Text style={[s.btnText, !shakeOn && { color: '#aaa' }]}>
          {shakeOn ? `📳  ${count} / ${required} secousses` : `📳  Secousses (${getTodayName()} → ${required})`}
        </Text>
      </TouchableOpacity>

      {shakeOn && (
        <View style={s.dots}>
          {Array.from({ length: required }).map((_, i) => (
            <View key={i} style={[s.dot, i < count && s.dotOn]} />
          ))}
        </View>
      )}

      <Text style={s.footer}>Sécurité avancée</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0d0d1a', alignItems: 'center', justifyContent: 'center', padding: 28 },
  logo:        { width: 100, height: 100, marginBottom: 16 },
  title:       { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  sub:         { color: '#555', fontSize: 13, marginBottom: 36 },
  btnPrimary:  { width: '100%', backgroundColor: '#4f46e5', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14, elevation: 6 },
  btnFaceId:   { backgroundColor: '#007aff' }, // iOS style blue for Face ID
  btnDisabled: { backgroundColor: '#1e1e2d', elevation: 0, opacity: 0.6 },
  btnSecondary:{ width: '100%', backgroundColor: '#161625', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 14 },
  btnActive:   { borderColor: '#f97316' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextDisabled: { color: '#555' },
  dots:        { flexDirection: 'row', gap: 10, marginTop: 6 },
  dot:         { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2a2a3e', borderWidth: 1.5, borderColor: '#3a3a5e' },
  dotOn:       { backgroundColor: '#f97316', borderColor: '#f97316' },
  footer:      { position: 'absolute', bottom: 28, color: '#333', fontSize: 11 },
});