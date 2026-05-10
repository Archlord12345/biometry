import ReactNativeBiometrics from 'react-native-biometrics';

// Initialisation paresseuse pour éviter un crash au chargement du module
let _rnBiometrics = null;
function getBiometrics() {
  if (!_rnBiometrics) {
    _rnBiometrics = new ReactNativeBiometrics();
  }
  return _rnBiometrics;
}

export async function checkBiometrics() {
  try {
    const { available, biometryType } = await getBiometrics().isSensorAvailable();
    return { available, type: biometryType };
  } catch (e) {
    return { available: false, type: null };
  }
}

export async function authenticate(promptMessage = 'Déverrouillez') {
  try {
    const { success, error } = await getBiometrics().simplePrompt({
      promptMessage,
      cancelButtonText: 'Annuler',
      allowDeviceCredentials: true, // active le fallback PIN / schéma / mot de passe
    });
    return { success, error };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function createKeys() {
  try {
    const { publicKey } = await getBiometrics().createKeys();
    return publicKey;
  } catch (e) {
    return null;
  }
}