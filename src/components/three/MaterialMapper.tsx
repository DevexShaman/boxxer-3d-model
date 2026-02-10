import { useEffect, Suspense } from 'react';
import * as THREE from 'three';
import TextureUpdater from './TextureUpdater';

import { Fabric } from '../../utils/parseFabrics';

interface MaterialMapperProps {
    scene: THREE.Group | THREE.Scene;
    parts: any;
    allFabrics: Fabric[];
}

/**
 * Component to handle material mapping and texture orchestration for each mesh.
 * It traverses the scene once to set colors and then renders TextureUpdaters
 * for meshes that have a texture active.
 */
const MaterialMapper = ({ scene, parts, allFabrics }: MaterialMapperProps) => {
    useEffect(() => {
        scene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const config = parts[child.name];
                if (config) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];

                    materials.forEach(mat => {
                        if (!(mat instanceof THREE.MeshStandardMaterial)) return;

                        // If texture is applied, TextureUpdater will handle the color reset to white.
                        // Otherwise, we apply the selected color.
                        if (!config.fabricId) {
                            mat.color.set(config.color);
                            mat.metalness = 0;
                            mat.roughness = 1;
                        }
                    });
                }
            }
        });
    }, [scene, parts]);

    return (
        <>
            {Object.keys(parts).map(partName => {
                const mesh = scene.getObjectByName(partName) as THREE.Mesh;
                // Only render the updater if the mesh exists and has a fabricId assigned
                const partConfig = parts[partName];
                const fabric = allFabrics.find(f => f.id === partConfig.fabricId);

                return (
                    <Suspense key={partName} fallback={null}>
                        <TextureUpdater
                            mesh={mesh}
                            config={{
                                ...partConfig,
                                lockedScale: fabric?.lockedScale || 2.0,
                                lockedNormalScale: fabric?.lockedNormalScale || 1.0
                            }}
                        />
                    </Suspense>
                );
            })}
        </>
    );
};

export default MaterialMapper;
