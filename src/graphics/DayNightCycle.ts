import * as THREE from 'three';

/** Duration in seconds of one full day/night cycle. */
const CYCLE_DURATION = 300;

/**
 * Animates a day/night cycle by updating an AmbientLight, a DirectionalLight
 * (sun), and the scene background/fog color.
 */
export class DayNightCycle {
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private scene: THREE.Scene;
  private time: number = 0;

  constructor(
    ambientLight: THREE.AmbientLight,
    dirLight: THREE.DirectionalLight,
    scene: THREE.Scene,
  ) {
    this.ambientLight = ambientLight;
    this.dirLight = dirLight;
    this.scene = scene;
  }

  update(deltaTime: number): void {
    this.time = (this.time + deltaTime) % CYCLE_DURATION;
    const t = this.time / CYCLE_DURATION;
    const angle = t * Math.PI * 2;

    // Normalised sun height: +1 = noon, -1 = midnight
    const sunHeight = Math.sin(angle);
    const dayFactor = Math.max(0, sunHeight);
    // 1 at sunrise/sunset, 0 at noon/midnight
    const dawnDusk = Math.max(0, 1 - Math.abs(sunHeight) * 4);

    // Sun position (arc above scene)
    this.dirLight.position.set(
      Math.cos(angle) * 80,
      Math.max(5, sunHeight * 80 + 10),
      50,
    );

    // Directional light intensity and colour
    this.dirLight.intensity = dayFactor * (0.9 + dawnDusk * 0.6);
    if (dawnDusk > 0.05) {
      // Warm orange at dawn/dusk
      this.dirLight.color.r = 1.0;
      this.dirLight.color.g = 0.55 + 0.45 * (1 - dawnDusk);
      this.dirLight.color.b = 0.2 * (1 - dawnDusk);
    } else {
      // Cool white during day
      this.dirLight.color.r = 1.0;
      this.dirLight.color.g = 0.97;
      this.dirLight.color.b = 0.92;
    }

    // Ambient: deep indigo at night, soft blue-white during day
    this.ambientLight.intensity = 0.15 + dayFactor * 0.45;
    this.ambientLight.color.r = 0.08 + dayFactor * 0.35;
    this.ambientLight.color.g = 0.08 + dayFactor * 0.38;
    this.ambientLight.color.b = 0.18 + dayFactor * 0.30;

    // Sky/fog colour
    const skyR = 0.025 + dayFactor * 0.04 + dawnDusk * 0.05;
    const skyG = 0.025 + dayFactor * 0.055 + dawnDusk * 0.02;
    const skyB = 0.06 + dayFactor * 0.07;

    this.scene.background = new THREE.Color(skyR, skyG, skyB);
    const fog = this.scene.fog as THREE.FogExp2 | null;
    if (fog) {
      const fogWithColor = fog as unknown as { color: THREE.Color };
      if (fogWithColor.color) {
        fogWithColor.color.r = skyR;
        fogWithColor.color.g = skyG;
        fogWithColor.color.b = skyB;
      }
    }
  }
}
