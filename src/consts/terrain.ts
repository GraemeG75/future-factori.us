// TerrainGeneration constants
export const TERRAIN_HEIGHT_SCALE = 13.5;

const BASE_TERRAIN_GEN = {
	warp: {
		frequency: 0.025,
		octaves: 3,
		strength: 24,
		seedOffsetA: 91,
		seedOffsetB: 137,
		domainOffsetB: 200
	},
	continent: {
		frequency: 0.008,
		octaves: 5,
		seedOffset: 11
	},
	detail: {
		frequency: 0.055,
		octaves: 4,
		seedOffset: 23,
		amplitude: 0.68
	},
	erosion: {
		frequency: 0.028,
		octaves: 3,
		seedOffset: 47,
		domainOffset: 400,
		strength: 0.62
	},
	ridge: {
		frequency: 0.02,
		octaves: 4,
		seedOffset: 71,
		domainOffset: 800,
		power: 1.7,
		strength: 1.35,
		maskStart: 0.42,
		maskEnd: 0.78
	},
	macroScale: 2.3,
	coastRadius: {
		angularScale: 2.2,
		domainOffset: 5200,
		octaves: 4,
		seedOffset: 719,
		base: 0.74,
		variation: 0.24
	},
	coastNoise: {
		frequency: 0.011,
		domainOffset: 1600,
		octaves: 3,
		seedOffset: 503,
		strength: 0.26
	},
	edgeFalloff: {
		innerOffset: -0.08,
		outerOffset: 0.2,
		power: 1.2
	},
	oceanCutoff: {
		floorHeight: -0.38,
		innerOffset: -0.12,
		outerOffset: 0.32
	},
	islandScatter: {
		frequency: 0.0065,
		domainOffset: 2600,
		octaves: 4,
		seedOffset: 601,
		maskStart: 0.42,
		maskEnd: 0.78,
		centerBias: 0.24,
		baseScale: 0.62,
		maskScale: 0.58
	},
	channels: {
		frequency: 0.014,
		domainOffset: 3400,
		octaves: 3,
		seedOffset: 677,
		ridgePower: 4,
		strength: 0.32,
		bandInnerStart: 0.25,
		bandInnerEnd: 0.48,
		bandOuterStart: 0.66,
		bandOuterEnd: 0.88
	},
	core: {
		maskStart: 0.08,
		maskEnd: 0.5,
		reliefFrequency: 0.034,
		reliefDomainOffset: 4300,
		reliefOctaves: 4,
		reliefSeedOffset: 743,
		reliefStrength: 0.82,
		baseLift: 0.09
	},
	inland: {
		maskStart: 0.58,
		maskEnd: 0.9,
		minHeight: -0.02,
		liftStrength: 0.72
	},
	sample: {
		normalEpsilon: 1.5,
		slopeScale: 1.35,
		flowConcavityScale: 1.8,
		flowFlatBias: 0.25,
		moistureFrequency: 0.03,
		moistureDomainOffset: 1200,
		moistureOctaves: 3,
		moistureSeedOffset: 211,
		detailFrequency: 0.38,
		detailDomainOffset: 2000,
		detailOctaves: 2,
		detailSeedOffset: 317
	}
} as const;

const BASE_TERRAIN_COAST = {
	blendHeightRange: 1.15,
	rockySlopeStart: 0.24,
	rockySlopeRange: 0.35,
	beachStrengthBase: 0.75,
	beachStrengthVariation: 0.2,
	rockyFadeByHeight: 0.55
} as const;

const BASE_WATER_STYLE = {
	textureBase: 198,
	textureRange: 10,
	textureRepeat: 8
} as const;

export const TERRAIN_PRESETS = {
	temperate: {
		seaLevel: -3.5,
		terrainGen: BASE_TERRAIN_GEN,
		terrainCoast: BASE_TERRAIN_COAST,
		waterStyle: BASE_WATER_STYLE
	},
	tropical: {
		seaLevel: -3.4,
		terrainGen: {
			...BASE_TERRAIN_GEN,
			coastRadius: {
				...BASE_TERRAIN_GEN.coastRadius,
				base: 0.79,
				variation: 0.3
			},
			coastNoise: {
				...BASE_TERRAIN_GEN.coastNoise,
				strength: 0.3
			},
			edgeFalloff: {
				...BASE_TERRAIN_GEN.edgeFalloff,
				innerOffset: -0.1,
				outerOffset: 0.24
			},
			channels: {
				...BASE_TERRAIN_GEN.channels,
				strength: 0.25
			},
			core: {
				...BASE_TERRAIN_GEN.core,
				reliefStrength: 0.55,
				baseLift: 0.12
			}
		},
		terrainCoast: {
			...BASE_TERRAIN_COAST,
			blendHeightRange: 1.45,
			rockySlopeStart: 0.3,
			beachStrengthBase: 0.92,
			rockyFadeByHeight: 0.66
		},
		waterStyle: {
			...BASE_WATER_STYLE,
			textureBase: 206,
			textureRange: 7,
			textureRepeat: 10
		}
	},
	volcanic: {
		seaLevel: -3.7,
		terrainGen: {
			...BASE_TERRAIN_GEN,
			macroScale: 2.7,
			detail: {
				...BASE_TERRAIN_GEN.detail,
				amplitude: 0.78
			},
			ridge: {
				...BASE_TERRAIN_GEN.ridge,
				power: 1.4,
				strength: 1.65
			},
			coastRadius: {
				...BASE_TERRAIN_GEN.coastRadius,
				base: 0.69,
				variation: 0.2
			},
			channels: {
				...BASE_TERRAIN_GEN.channels,
				strength: 0.42
			},
			core: {
				...BASE_TERRAIN_GEN.core,
				reliefStrength: 1.04,
				baseLift: 0.05
			}
		},
		terrainCoast: {
			...BASE_TERRAIN_COAST,
			blendHeightRange: 0.9,
			rockySlopeStart: 0.16,
			rockySlopeRange: 0.26,
			beachStrengthBase: 0.45,
			beachStrengthVariation: 0.12,
			rockyFadeByHeight: 0.42
		},
		waterStyle: {
			...BASE_WATER_STYLE,
			textureBase: 186,
			textureRange: 13,
			textureRepeat: 7
		}
	},
	// Wide sandy coastlines surrounding a rugged mountainous interior.
	// Great for industrial maps — flat buildable beach ring, dramatic highlands in the core.
	rugged_highland: {
		seaLevel: -3.5,
		terrainGen: {
			...BASE_TERRAIN_GEN,
			macroScale: 2.6,
			detail: {
				...BASE_TERRAIN_GEN.detail,
				amplitude: 0.72
			},
			erosion: {
				...BASE_TERRAIN_GEN.erosion,
				strength: 0.48   // less erosion → sharper highland peaks
			},
			ridge: {
				...BASE_TERRAIN_GEN.ridge,
				power: 1.5,
				strength: 1.55,
				maskStart: 0.38, // ridges kick in earlier → more coverage
				maskEnd: 0.72
			},
			// Slightly wider island footprint so beaches have room to breathe
			coastRadius: {
				...BASE_TERRAIN_GEN.coastRadius,
				base: 0.80,
				variation: 0.28
			},
			// More pronounced coastal dents for an irregular shoreline
			coastNoise: {
				...BASE_TERRAIN_GEN.coastNoise,
				strength: 0.31
			},
			edgeFalloff: {
				...BASE_TERRAIN_GEN.edgeFalloff,
				innerOffset: -0.12,
				outerOffset: 0.22,
				power: 1.4       // sharper coast-to-ocean drop
			},
			// Fewer channels → more contiguous land
			channels: {
				...BASE_TERRAIN_GEN.channels,
				strength: 0.18,
				bandInnerStart: 0.3,
				bandInnerEnd: 0.52
			},
			// Strong core relief to build up the mountain interior
			core: {
				...BASE_TERRAIN_GEN.core,
				maskEnd: 0.44,
				reliefStrength: 1.1,
				baseLift: 0.18
			},
			inland: {
				...BASE_TERRAIN_GEN.inland,
				minHeight: 0.04, // inland floor higher → no central water
				liftStrength: 0.84
			}
		},
		terrainCoast: {
			// Wide sandy beach band, transitioning to rock only on steep promontories
			blendHeightRange: 1.6,
			rockySlopeStart: 0.3,
			rockySlopeRange: 0.4,
			beachStrengthBase: 0.92,
			beachStrengthVariation: 0.25,
			rockyFadeByHeight: 0.7
		},
		waterStyle: {
			...BASE_WATER_STYLE,
			textureBase: 194,
			textureRange: 9,
			textureRepeat: 9
		}
	}
} as const;

export type TerrainPresetName = keyof typeof TERRAIN_PRESETS;

export const ACTIVE_TERRAIN_PRESET: TerrainPresetName = 'rugged_highland';

// ---------------------------------------------------------------------------
// Terrain LOD — texture detail tiers driven by camera zoom radius.
// Each tier defines the maximum camera radius that triggers it (inclusive) and
// the terrain texture repeat value used for that tier.
// Higher textureRepeat = denser perceived detail when zoomed in.
// Debounce avoids rapid texture updates while actively zooming.
// ---------------------------------------------------------------------------
export const TERRAIN_LOD = {
  rebuildDebounce: 0.35,  // seconds to wait after last zoom change before updating texture detail
  tiers: [
		{ maxRadius: 18,  textureRepeat: 36 }, // very close — highest detail
		{ maxRadius: 45,  textureRepeat: 30 }, // close
		{ maxRadius: 90,  textureRepeat: 24 }, // medium
		{ maxRadius: 145, textureRepeat: 18 }, // far
		{ maxRadius: 999, textureRepeat: 14 }, // very far
  ]
} as const;

const ACTIVE_TERRAIN_CONFIG = TERRAIN_PRESETS[ACTIVE_TERRAIN_PRESET];

export const TERRAIN_SEA_LEVEL = ACTIVE_TERRAIN_CONFIG.seaLevel;
export const TERRAIN_GEN = ACTIVE_TERRAIN_CONFIG.terrainGen;
export const TERRAIN_COAST = ACTIVE_TERRAIN_CONFIG.terrainCoast;
export const WATER_STYLE = ACTIVE_TERRAIN_CONFIG.waterStyle;

// ModelFactory terrain-rendering constants
export const TERRAIN_VISUAL_PRESETS = {
	enhanced: {
		gridHeightOffset: 0.08,
		voxelHeight: 0.10,
		baseHeight: -28.0,
		textureRepeat: 2.1,
		minColumns: 180,
		minRows: 180,
		sideColorBrightness: 0.50,
		sideSaturationOffset: -0.04,
		sideLightnessOffset: -0.08,
		sideAltStripe: 0.08,
		sideAltDarken: 0.12,
		voxelTopVariation: 0.12,
		voxelTopGridStrength: 0.18,
		voxelBandHeight: 0.45,
		voxelBandHueShift: 0.014,
		voxelBandSaturation: 0.09,
		voxelBandLightness: 0.08,
		topBevelStrength: 0.09,
		topBevelDirectionX: 0.82,
		topBevelDirectionZ: -0.58
	},
	ultra_voxel: {
		gridHeightOffset: 0.08,
		voxelHeight: 0.10,
		baseHeight: -28.0,
		textureRepeat: 1.85,
		minColumns: 200,
		minRows: 200,
		sideColorBrightness: 0.42,
		sideSaturationOffset: -0.06,
		sideLightnessOffset: -0.14,
		sideAltStripe: 0.12,
		sideAltDarken: 0.19,
		voxelTopVariation: 0.2,
		voxelTopGridStrength: 0.28,
		voxelBandHeight: 0.32,
		voxelBandHueShift: 0.022,
		voxelBandSaturation: 0.14,
		voxelBandLightness: 0.12,
		topBevelStrength: 0.14,
		topBevelDirectionX: 0.9,
		topBevelDirectionZ: -0.42
	}
} as const;

export type TerrainVisualPresetName = keyof typeof TERRAIN_VISUAL_PRESETS;

// Switch this to 'ultra_voxel' for a bolder, more stylized voxel look.
export const ACTIVE_TERRAIN_VISUAL_PRESET: TerrainVisualPresetName = 'enhanced';

const ACTIVE_TERRAIN_VISUAL = TERRAIN_VISUAL_PRESETS[ACTIVE_TERRAIN_VISUAL_PRESET];

export const GRID_HEIGHT_OFFSET = ACTIVE_TERRAIN_VISUAL.gridHeightOffset;
export const VOXEL_HEIGHT = ACTIVE_TERRAIN_VISUAL.voxelHeight;
export const TERRAIN_BASE_HEIGHT = ACTIVE_TERRAIN_VISUAL.baseHeight;
export const TERRAIN_TEXTURE_REPEAT = ACTIVE_TERRAIN_VISUAL.textureRepeat;
export const MIN_TERRAIN_COLUMNS = ACTIVE_TERRAIN_VISUAL.minColumns;
export const MIN_TERRAIN_ROWS = ACTIVE_TERRAIN_VISUAL.minRows;
export const TERRAIN_SIDE_COLOR_BRIGHTNESS = ACTIVE_TERRAIN_VISUAL.sideColorBrightness;
export const TERRAIN_SIDE_SATURATION_OFFSET = ACTIVE_TERRAIN_VISUAL.sideSaturationOffset;
export const TERRAIN_SIDE_LIGHTNESS_OFFSET = ACTIVE_TERRAIN_VISUAL.sideLightnessOffset;
export const TERRAIN_SIDE_ALT_STRIPE = ACTIVE_TERRAIN_VISUAL.sideAltStripe;
export const TERRAIN_SIDE_ALT_DARKEN = ACTIVE_TERRAIN_VISUAL.sideAltDarken;
export const TERRAIN_VOXEL_TOP_VARIATION = ACTIVE_TERRAIN_VISUAL.voxelTopVariation;
export const TERRAIN_VOXEL_TOP_GRID_STRENGTH = ACTIVE_TERRAIN_VISUAL.voxelTopGridStrength;
export const TERRAIN_VOXEL_BAND_HEIGHT = ACTIVE_TERRAIN_VISUAL.voxelBandHeight;
export const TERRAIN_VOXEL_BAND_HUE_SHIFT = ACTIVE_TERRAIN_VISUAL.voxelBandHueShift;
export const TERRAIN_VOXEL_BAND_SATURATION = ACTIVE_TERRAIN_VISUAL.voxelBandSaturation;
export const TERRAIN_VOXEL_BAND_LIGHTNESS = ACTIVE_TERRAIN_VISUAL.voxelBandLightness;
export const TERRAIN_TOP_BEVEL_STRENGTH = ACTIVE_TERRAIN_VISUAL.topBevelStrength;
export const TERRAIN_TOP_BEVEL_DIRECTION_X = ACTIVE_TERRAIN_VISUAL.topBevelDirectionX;
export const TERRAIN_TOP_BEVEL_DIRECTION_Z = ACTIVE_TERRAIN_VISUAL.topBevelDirectionZ;
