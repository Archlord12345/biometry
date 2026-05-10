# BiometryLock

Application React Native de démonstration combinant **biométrie**, **caméra** et **détection de secousses**. Elle se présente comme un écran de verrouillage personnalisé avec deux méthodes de déverrouillage et un tableau de bord pour tester chaque fonctionnalité.

---

## 🏗️ Architecture du projet

```
biometry/
├── src/
│   ├── components/
│   │   ├── LockScreen.js       ← Écran de verrouillage (biométrie + secousses)
│   │   └── HomeScreen.js       ← Tableau de bord (caméra, empreinte, secousse)
│   ├── utils/
│   │   ├── biometrics.js       ← Authentification biométrique (react-native-biometrics v3)
│   │   ├── camera.js           ← Permissions et capture photo (react-native-vision-camera v5)
│   │   ├── accelerometer.js    ← Détection de secousses (react-native-sensors + rxjs)
│   │   └── shakeCode.js        ← Calcul du code journalier de secousses
│   └── styles/
│       ├── HomeScreen.styles.js  ← Styles séparés (optionnel, non utilisés dans la version compacte)
│       └── LockScreen.styles.js  ← Styles séparés (optionnel, non utilisés dans la version compacte)
├── App.tsx                     ← Point d'entrée, gère l'état verrouillé/déverrouillé
├── android/app/src/main/AndroidManifest.xml  ← Permissions + showWhenLocked
└── patches/
    └── react-native-sensors+7.3.6.patch  ← Correction build Gradle (patch-package)
```

---

## ✨ Fonctionnalités

### 🔒 LockScreen — Écran de verrouillage
Affiché **par-dessus l'écran de verrouillage natif** du téléphone grâce aux flags Android `showWhenLocked` et `turnScreenOn`.

Deux méthodes de déverrouillage :
| Méthode | Description |
|---------|-------------|
| 🎭 **Biométrie** | Face ID / Empreinte digitale via `react-native-biometrics` |
| 📳 **Secousses** | Nombre de secousses variable selon le jour (voir formule ci-dessous) |

#### Formule du code de secousses journalier
```
j = numéro du jour (Lundi=1, Mardi=2, ..., Dimanche=7)
nb_secousses = (j × j) % 5    (remplacé par 5 si le résultat est 0)
```

| Jour | j | (j²)%5 | Secousses requises |
|------|---|--------|--------------------|
| Lundi | 1 | 1 | **1** |
| Mardi | 2 | 4 | **4** |
| Mercredi | 3 | 4 | **4** |
| Jeudi | 4 | 1 | **1** |
| Vendredi | 5 | 0→5 | **5** |
| Samedi | 6 | 1 | **1** |
| Dimanche | 7 | 4 | **4** |

Un compteur visuel (points oranges) s'allume à chaque secousse détectée.

### 🏠 HomeScreen — Tableau de bord
2 cartes interactives avec badge ON/OFF :

| Carte | Fonctionnalité |
|-------|---------------|
| 👆 **Empreinte** | Teste l'authentification biométrique |
| 📳 **Secousse** | Active la détection de secousse pour déclencher la biométrie |

---

## 📦 Dépendances clés

```json
"react-native-biometrics": "^3.0.1",
"react-native-vision-camera": "^5.0.8",
"react-native-sensors": "^7.3.6",
"react-native-safe-area-context": "^5.5.2",
"react-native-nitro-modules": "^0.35.6",
"rxjs": "^7.8.2"
```

> ⚠️ `react-native-biometrics` v3 requiert une **instanciation** : `new ReactNativeBiometrics()`.  
> ⚠️ `react-native-vision-camera` v5 utilise `useCameraDevice('back')` au lieu de `useCameraDevices()`.

---

## 🚀 Lancer le projet

### Prérequis
- Node.js >= 22.11.0
- Android SDK / JDK configurés
- Téléphone Android connecté ou émulateur lancé

### Installation

```bash
npm install
```

### Démarrer Metro

```bash
npm run start
# ou avec reset cache si écran blanc/noir
npm run start -- --reset-cache
```

### Compiler et installer sur Android

```bash
npm run android
```

> **Connexion téléphone physique** : si l'écran reste blanc après installation, exécutez :
> ```bash
> adb reverse tcp:8081 tcp:8081
> ```
> Puis appuyez sur `r` dans le terminal Metro pour recharger.

---

## 🔧 Correction build Android (react-native-sensors)

`react-native-sensors` utilise d'anciens dépôts Gradle (`jcenter`, plugin 3.5.1). Un patch est déjà inclus dans `patches/`.

Pour le régénérer si besoin :
```bash
sed -i 's/jcenter()/mavenCentral()/g' node_modules/react-native-sensors/android/build.gradle
sed -i 's/gradle:3.5.1/gradle:7.4.2/g' node_modules/react-native-sensors/android/build.gradle
npx patch-package react-native-sensors
```

Le script `postinstall` dans `package.json` applique automatiquement le patch à chaque `npm install`.

---

## 🔐 Permissions Android

Déclarées dans `AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

L'activité principale est configurée pour s'afficher par-dessus l'écran natif :
```xml
android:showWhenLocked="true"
android:turnScreenOn="true"
```

---

## 🐛 Dépannage

| Problème | Solution |
|---------|----------|
| Écran blanc au démarrage | `adb reverse tcp:8081 tcp:8081` puis `r` dans Metro |
| Écran blanc persistant | `npm run start -- --reset-cache` |
| Build échoue (jcenter) | Appliquer le patch `react-native-sensors` (voir section ci-dessus) |
| Biométrie crash | Vérifier que le module natif est lié : `npm run android` (pas juste Metro) |
| Secousses en boucle | Comportement corrigé via `cameraOpenRef` — ne se redéclenche pas si caméra déjà ouverte |

---

## 📋 Scripts disponibles

```bash
npm run android   # Build + install sur Android
npm run ios       # Build + install sur iOS
npm run start     # Démarrer Metro
npm run lint      # ESLint
npm run test      # Jest
```
