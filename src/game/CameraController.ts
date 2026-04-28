import * as THREE from 'three';
import { MIN_RADIUS, MAX_RADIUS, MIN_PHI, MAX_PHI, PAN_SPEED, ORBIT_KEY_SPEED, LERP_SPEED, ZOOM_SENSITIVITY } from '../consts/camera';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private theta: number;
  private phi: number;
  private radius: number;
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private lastMouse: { x: number; y: number } = { x: 0, y: 0 };
  private targetTarget: THREE.Vector3;
  private targetRadius: number;
  private targetTheta: number;
  private targetPhi: number;
  private keysHeld: Set<string> = new Set();
  private domElement: HTMLElement;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3(0, 0, 0);
    this.targetTarget = new THREE.Vector3(0, 0, 0);
    this.theta = Math.PI / 4;
    this.phi = Math.PI / 4;
    this.radius = 30;
    this.targetRadius = this.radius;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;

    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);

    domElement.addEventListener('mousedown', this.boundMouseDown);
    domElement.addEventListener('mousemove', this.boundMouseMove);
    domElement.addEventListener('mouseup', this.boundMouseUp);
    domElement.addEventListener('wheel', this.boundWheel, { passive: true });
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    this.updateCameraPosition();
  }

  onMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.isDragging = true;
    } else if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
    }
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  onMouseMove(e: MouseEvent): void {
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.lastMouse = { x: e.clientX, y: e.clientY };

    if (this.isDragging) {
      this.targetTheta -= dx * 0.005;
      this.targetPhi = Math.max(MIN_PHI, Math.min(MAX_PHI, this.targetPhi - dy * 0.005));
    } else if (this.isPanning) {
      const right = new THREE.Vector3(Math.cos(this.theta), 0, -Math.sin(this.theta));
      const forward = new THREE.Vector3(-Math.sin(this.theta), 0, -Math.cos(this.theta));
      const panScale = this.radius * 0.001;
      this.targetTarget.addScaledVector(right, -dx * panScale);
      this.targetTarget.addScaledVector(forward, dy * panScale);
    }
  }

  onMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.isDragging = false;
    if (e.button === 1 || e.button === 2) this.isPanning = false;
  }

  onWheel(e: WheelEvent): void {
    this.targetRadius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, this.targetRadius + e.deltaY * ZOOM_SENSITIVITY * this.targetRadius));
  }

  onKeyDown(e: KeyboardEvent): void {
    this.keysHeld.add(e.code);
  }

  onKeyUp(e: KeyboardEvent): void {
    this.keysHeld.delete(e.code);
  }

  focusOn(position: THREE.Vector3, _duration?: number): void {
    this.targetTarget.copy(position);
  }

  pan(dx: number, dz: number): void {
    this.targetTarget.x += dx;
    this.targetTarget.z += dz;
  }

  update(deltaTime: number): void {
    const panDelta = PAN_SPEED * deltaTime;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) {
      this.targetTarget.x -= Math.sin(this.theta) * panDelta;
      this.targetTarget.z -= Math.cos(this.theta) * panDelta;
    }
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) {
      this.targetTarget.x += Math.sin(this.theta) * panDelta;
      this.targetTarget.z += Math.cos(this.theta) * panDelta;
    }
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) {
      this.targetTarget.x -= Math.cos(this.theta) * panDelta;
      this.targetTarget.z += Math.sin(this.theta) * panDelta;
    }
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) {
      this.targetTarget.x += Math.cos(this.theta) * panDelta;
      this.targetTarget.z -= Math.sin(this.theta) * panDelta;
    }
    if (this.keysHeld.has('KeyQ')) {
      this.targetTheta += ORBIT_KEY_SPEED * deltaTime;
    }
    if (this.keysHeld.has('KeyE')) {
      this.targetTheta -= ORBIT_KEY_SPEED * deltaTime;
    }

    const lerpFactor = Math.min(1, LERP_SPEED * deltaTime);
    this.theta += (this.targetTheta - this.theta) * lerpFactor;
    this.phi += (this.targetPhi - this.phi) * lerpFactor;
    this.radius += (this.targetRadius - this.radius) * lerpFactor;
    this.target.lerp(this.targetTarget, lerpFactor);

    this.updateCameraPosition();
  }

  private updateCameraPosition(): void {
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);
    this.camera.position.set(
      this.target.x + this.radius * sinPhi * sinTheta,
      this.target.y + this.radius * cosPhi,
      this.target.z + this.radius * sinPhi * cosTheta
    );
    this.camera.lookAt(this.target);
  }

  dispose(): void {
    this.domElement.removeEventListener('mousedown', this.boundMouseDown);
    this.domElement.removeEventListener('mousemove', this.boundMouseMove);
    this.domElement.removeEventListener('mouseup', this.boundMouseUp);
    this.domElement.removeEventListener('wheel', this.boundWheel);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
