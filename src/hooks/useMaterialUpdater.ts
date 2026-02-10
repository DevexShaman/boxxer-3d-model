import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Custom hook to update materials on a 3D object based on Redux state
 */
export const useMaterialUpdater = (scene: THREE.Group | THREE.Scene) => {
    const parts = useSelector((state: RootState) => state.product.parts);

    useEffect(() => {
        if (!scene) return;

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const partConfig = parts[child.name];
                if (partConfig) {
                    if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.color.set(partConfig.color);

                        // Handle textures if needed
                        // if (partConfig.texture) { ... }
                    }
                }
            }
        });
    }, [scene, parts]);
};
