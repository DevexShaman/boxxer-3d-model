import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface TextureUpdaterProps {
    mesh: THREE.Mesh;
    config: {
        fabricId: string | null;
        maps: {
            map?: string;
            normalMap?: string;
            roughnessMap?: string;
            metalnessMap?: string;
            displacementMap?: string;
            aoMap?: string;
        } | null;
        lockedScale: number;
        lockedNormalScale: number;
    };
}

/**
 * Helper to apply fabric textures with unified LOCKED tiling.
 * Inverts the scale to repeat count logic to ensure high visibility.
 */
const applyLockedFabricTextures = (
    material: THREE.MeshPhysicalMaterial,
    textures: Record<string, THREE.Texture>,
    config: { lockedScale: number; lockedNormalScale: number },
    fabricId: string | null
) => {
    const { lockedScale, lockedNormalScale } = config;

    // ULTRA-AGGRESSIVE VISIBILITY BOOST
    // A boost of 2.0 makes the pattern 2x larger than the metadata scale.
    const VISIBILITY_BOOST = 20.0

    // PATTERN ENLARGEMENT LOGIC (Aggressive)
    // Repeat count = 1 / (scale * boost). 
    // Example: Scale 15 (Cotton) * Boost 2.0 -> Repeat 0.033 -> Massive visibility.
    const repeatValue = Math.max(0.005, 1 / (lockedScale * VISIBILITY_BOOST));

    // DIAGNOSTIC LOGGING (Extreme Pattern Mode)
    console.info(`[TextureUpdater] APPLYING EXTREME FABRIC: ${fabricId}`, {
        lockedScale,
        boost: VISIBILITY_BOOST,
        finalRepeat: repeatValue.toFixed(4),
        lockedNormalScale
    });

    Object.keys(textures).forEach((key) => {
        const tex = textures[key];
        if (!tex || !tex.image) return; // Loading Guard

        // Unified Tiling Architecture
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatValue, repeatValue);
        tex.rotation = 0;
        tex.center.set(0.5, 0.5);
        tex.flipY = false;
        tex.anisotropy = 16;

        // Assign to correct slot with proper ColorSpace (Three.js 0.182.0 standard)
        if (key === 'map') {
            material.map = tex;
            tex.colorSpace = THREE.SRGBColorSpace;
        } else if (key === 'normalMap') {
            material.normalMap = tex;
            tex.colorSpace = THREE.NoColorSpace;
        } else if (key === 'roughnessMap') {
            material.roughnessMap = tex;
            tex.colorSpace = THREE.NoColorSpace;
        } else if (key === 'metalnessMap') {
            material.metalnessMap = tex;
            tex.colorSpace = THREE.NoColorSpace;
        } else if (key === 'aoMap') {
            material.aoMap = tex;
            tex.colorSpace = THREE.NoColorSpace;
        }

        tex.needsUpdate = true;
    });

    // Calibrate Normal Intensity based on Fabric Category
    material.normalScale.set(lockedNormalScale, lockedNormalScale);

    // Reset base color if we have a map to avoid unwanted tinting
    if (textures.map?.image) {
        material.color.set('#ffffff');
    }

    material.needsUpdate = true;
};

/**
 * Enhanced Material Applier for high-fidelity fabric rendering.
 * Manages dynamic PBR maps, locked tiling, and visibility optimization.
 */
const TextureUpdater = ({ mesh, config }: TextureUpdaterProps) => {
    const paths = useMemo(() => {
        if (!config.maps) return {};
        const entries = Object.entries(config.maps).filter(([_, url]) => !!url);
        return Object.fromEntries(entries);
    }, [config.maps]);

    const textures = useTexture(paths) as Record<string, THREE.Texture>;

    useEffect(() => {
        // LOADING GUARD: Only proceed if the primary map is ready
        if (!mesh || !config.maps || (paths.map && !textures.map?.image)) return;

        const originalMaterial = mesh.material;
        const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];

        materials.forEach((mat, index) => {
            if (!(mat instanceof THREE.MeshStandardMaterial)) return;

            // Ensure we use MeshPhysicalMaterial for professional fabric response
            let targetMat: THREE.MeshPhysicalMaterial;
            if (mat instanceof THREE.MeshPhysicalMaterial) {
                targetMat = mat;
            } else {
                targetMat = new THREE.MeshPhysicalMaterial();
                THREE.MeshStandardMaterial.prototype.copy.call(targetMat, mat);
                if (Array.isArray(mesh.material)) {
                    mesh.material[index] = targetMat;
                } else {
                    mesh.material = targetMat;
                }
            }

            // Apply unified LOCKED PBR textures
            applyLockedFabricTextures(targetMat, textures, {
                lockedScale: config.lockedScale,
                lockedNormalScale: config.lockedNormalScale
            }, config.fabricId);

            // Advanced PBR Fabric Tuning (360° Stabilization)
            // MATERIAL SAFETY CONTROLS: Prevent blowouts at grazing angles
            targetMat.roughness = Math.max(0.35, targetMat.roughness); // Clamp for cloth realism
            targetMat.metalness = 0; // Fabrics are non-metallic

            // Sheen Calibration (Simulates microscopic fiber reflection)
            // Reduced intensity to avoid "halo" effects at extreme angles
            targetMat.sheen = 0.7;
            targetMat.sheenRoughness = 0.8;
            if (targetMat.sheenColor) targetMat.sheenColor.set('#ffffff');

            // Minimal clearcoat to avoid "plastic" highlights
            targetMat.clearcoat = 0.01;
            targetMat.clearcoatRoughness = 0.1;
        });

        return () => { };
    }, [mesh, textures, config.lockedScale, config.lockedNormalScale, config.maps]);

    return null;
};

export default TextureUpdater;
