import * as THREE from 'three';

export class RetroMaterials {
  static neonGlow(color: THREE.ColorRepresentation, emissive?: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: emissive ?? color,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.5,
    });
  }

  static metallic(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.2,
      metalness: 0.9,
    });
  }

  static grid(color: THREE.ColorRepresentation): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
  }

  static wireframe(color: THREE.ColorRepresentation): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
    });
  }

  static glowing(color: THREE.ColorRepresentation, intensity: number = 1.0): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
  }

  static forBuilding(typeId: string): THREE.MeshStandardMaterial {
    const harvesters = ['wood_harvester', 'coal_mine', 'iron_mine', 'water_pump', 'silicon_extractor', 'uranium_extractor'];
    const factories = ['basic_factory', 'smelter', 'circuit_fab', 'refinery'];
    if (harvesters.includes(typeId)) return RetroMaterials.neonGlow(0xff8c00);
    if (factories.includes(typeId)) return RetroMaterials.neonGlow(0x0088ff);
    if (typeId === 'research_center') return RetroMaterials.neonGlow(0x8800ff);
    if (typeId === 'trading_terminal') return RetroMaterials.neonGlow(0x00ff88);
    if (typeId === 'storage_depot') return RetroMaterials.metallic(0x667788);
    if (typeId === 'power_plant') return RetroMaterials.neonGlow(0xffcc00);
    if (typeId === 'exotic_lab') return RetroMaterials.glowing(0xff00ff, 1.2);
    return RetroMaterials.neonGlow(0x888888);
  }

  static forResource(resourceId: string): THREE.MeshStandardMaterial {
    const colors: Record<string, number> = {
      wood: 0x8B4513,
      coal: 0x333333,
      iron: 0x8B7355,
      water: 0x0077ff,
      silicon: 0xc0c0ff,
      uranium: 0x00ff44,
      steel: 0x999999,
      circuit: 0x00aaff,
      fuel: 0xff6600,
      exotic: 0xff00ff,
    };
    const color = colors[resourceId] ?? 0xffffff;
    return RetroMaterials.neonGlow(color);
  }

  static forRoute(resourceId: string): THREE.LineBasicMaterial {
    const colors: Record<string, number> = {
      wood: 0x8B4513,
      coal: 0x666666,
      iron: 0xaaaa88,
      water: 0x0099ff,
      silicon: 0xbbbbff,
      uranium: 0x44ff88,
      steel: 0xbbbbbb,
      circuit: 0x33ccff,
      fuel: 0xff8800,
      exotic: 0xff44ff,
    };
    const color = colors[resourceId] ?? 0x00ffff;
    return new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });
  }
}
