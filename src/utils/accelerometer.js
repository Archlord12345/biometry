import { accelerometer } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

let subscription = null;
let lastShake = 0;
const COOLDOWN = 600;

export function startShakeDetection(onShake, threshold = 15) {
  if (subscription) subscription.unsubscribe();
  
  console.log('Détection de secousses démarrée (Seuil:', threshold, ')');
  
  subscription = accelerometer
    .pipe(
      map(({ x, y, z }) => Math.sqrt(x*x + y*y + z*z)),
      filter(acc => {
        const now = Date.now();
        if (acc > threshold && (now - lastShake) > COOLDOWN) {
          console.log('Secousse détectée! Accel:', acc.toFixed(2));
          lastShake = now;
          return true;
        }
        return false;
      })
    )
    .subscribe(() => onShake());
    
  return () => stopShakeDetection();
}

export function stopShakeDetection() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
}