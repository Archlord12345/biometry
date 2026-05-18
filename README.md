<p align="center">
  <img src="src/assets/logo.png" width="120" height="120" alt="BiometryLock Logo" />
</p>

# BiometryLock

Application React Native de démonstration combinant **biométrie**, **caméra** et **détection de secousses**. Elle se présente comme un écran de verrouillage personnalisé avec des méthodes de déverrouillage sécurisées et un tableau de bord de test.

---

## 🏗️ Architecture du projet

Le projet est structuré pour séparer la logique métier (utils) des composants graphiques (components).

```
biometry/
├── src/
│   ├── components/
│   │   ├── LockScreen.js       ← Écran de verrouillage (biométrie + secousses)
│   │   └── HomeScreen.js       ← Tableau de bord (empreinte, secousse)
│   ├── utils/
│   │   ├── biometrics.js       ← Authentification biométrique (react-native-biometrics v3)
│   │   ├── camera.js           ← Permissions et capture photo (react-native-vision-camera v5)
│   │   ├── accelerometer.js    ← Détection de secousses (react-native-sensors + rxjs)
│   │   └── shakeCode.js        ← Calcul du code journalier de secousses
├── App.tsx                     ← Point d'entrée, gère l'état verrouillé/déverrouillé
├── android/app/src/main/AndroidManifest.xml  ← Permissions + configuration système
└── patches/
    └── react-native-sensors+7.3.6.patch  ← Correctif pour la compatibilité Gradle
```

---

## ✨ Fonctionnalités principales

### 🔒 Écran de verrouillage (LockScreen)
Cet écran remplace visuellement l'écran de verrouillage natif sur Android grâce aux paramètres `showWhenLocked` et `turnScreenOn`.

Méthodes de déverrouillage disponibles :
| Méthode | Description |
|---------|-------------|
| 👆 **Empreinte digitale** | Utilise le capteur biométrique de l'appareil via `react-native-biometrics`. |
| 📳 **Secousses** | Déverrouillage par mouvement physique (accéléromètre). |

#### 📐 Logique des secousses journalières
Le nombre de secousses requises change chaque jour pour renforcer la sécurité par "code changeant" :
- **Formule** : `(jour_de_la_semaine² % 5)`. Si le résultat est `0` (comme le vendredi), l'appareil se déverrouille instantanément par un simple appui sur le bouton **Secousses** (aucune secousse physique requise).
- **Exemple** : Lundi (1) = 1 secousse, Mardi (2) = 4 secousses, Vendredi (5) = 0 secousse (déverrouillage au clic sur le bouton).

### 🏠 Tableau de bord (HomeScreen)
Une interface de gestion pour tester les capteurs :
- **Test Biométrique** : Vérifie la réactivité du capteur d'empreinte.
- **Détection Active** : Active l'accéléromètre en arrière-plan pour déclencher une authentification par secousse.

---

## 📦 Dépendances techniques

- **Biométrie** : `react-native-biometrics` v3 (nécessite une instanciation `new ReactNativeBiometrics()`).
- **Capteurs** : `react-native-sensors` associé à `rxjs` pour le traitement des flux de données de l'accéléromètre.
- **Interface** : `react-native-safe-area-context` pour une gestion propre des encoches (notches).

---

## 🚀 Installation et Lancement

### 1. Prérequis
- Node.js (>= 22.11.0)
- Environnement Android (SDK, JDK, ADB)

### 2. Installation
```bash
npm install
```

### 3. Lancement de l'application
```bash
# Démarrer le serveur Metro
npm start

# Lancer sur Android
npm run android
```

---

## 🔧 Configuration et Maintenance

### Correction de `react-native-sensors`
Le projet inclut un patch automatique (via `patch-package`) pour corriger une erreur de build liée à l'ancien dépôt `jcenter` dans la bibliothèque de capteurs.

### Permissions Android
Les permissions suivantes sont essentielles dans le fichier `AndroidManifest.xml` :
- `USE_BIOMETRIC` / `USE_FINGERPRINT`
- `HIGH_SAMPLING_RATE_SENSORS`
- `CAMERA`

---

## 📋 Résumé de la réalisation
Ce projet démontre l'intégration de capteurs de bas niveau dans un environnement React Native moderne, avec une gestion robuste des états de verrouillage et des permissions natives.
