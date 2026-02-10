import { useEffect, useState, useMemo, Suspense } from 'react';
import { useGLTF, Decal as DreiDecal, useTexture } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import * as THREE from 'three';

const ProductModel = () => {
    const { modelUrl, parts, decals } = useSelector((state: RootState) => state.product);
    // Load GLTF - letting Suspense handle the loading state
    const model = useGLTF(modelUrl) as any;

    // Diagnostic Log: List all mesh names in the model
    useEffect(() => {
        if (model?.scene) {
            const meshNames: string[] = [];
            model.scene.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                    meshNames.push(child.name);
                }
            });
            console.log('--- Product Model Mesh Names ---');
            console.log(meshNames.join(', '));
            console.log('--------------------------------');
        }
    }, [model]);

    // If model is not loaded yet (though useGLTF usually suspends)
    if (!model) return null;

    return (
        <primitive object={model.scene} scale={0.2}>
            {/* Traverse and apply materials to model scene meshes */}
            <MaterialMapper scene={model.scene} parts={parts} />

            {decals.map((decal) => (
                <DecalInstance key={decal.id} decal={decal} scene={model.scene} />
            ))}
        </primitive>
    );
};

/**
 * Component to handle material mapping and texture updates for each mesh
 */
const MaterialMapper = ({ scene, parts }: { scene: THREE.Group; parts: any }) => {
    useEffect(() => {
        scene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const config = parts[child.name];
                if (config) {
                    const material = child.material as THREE.MeshStandardMaterial;

                    // If texture is applied, don't tint it with the selected color (keep it white)
                    // unless you want a tinted effect. For "realistic" fabric, we usually want white.
                    if (config.texture) {
                        material.color.set('#ffffff');
                    } else {
                        material.color.set(config.color);
                    }

                    material.metalness = 0;
                    material.roughness = 1;
                }
            }
        });
    }, [scene, parts]);

    return (
        <>
            {Object.keys(parts).map(partName => {
                const mesh = scene.getObjectByName(partName) as THREE.Mesh;
                if (!mesh || !parts[partName].texture) return null;
                return (
                    <Suspense key={partName} fallback={null}>
                        <TextureUpdater
                            mesh={mesh}
                            config={parts[partName]}
                        />
                    </Suspense>
                );
            })}
        </>
    );
};

/**
 * Helper to dynamically load and apply PBR textures to a mesh
 */
const TextureUpdater = ({ mesh, config }: { mesh: THREE.Mesh; config: any }) => {
    // Determine file paths based on texture ID
    const paths = useMemo(() => ({
        map: `/textures/${config.texture}_albedo.jpg`,
        normalMap: `/textures/${config.texture}_normal.jpg`,
        roughnessMap: `/textures/${config.texture}_roughness.jpg`,
    }), [config.texture]);

    // useTexture handles caching and loading. 
    // If files are missing, it will suspend and possibly error.
    // We wrap this component in Suspense in the parent to handle it.
    const textures = useTexture(paths) as any;

    useEffect(() => {
        if (!mesh) return;

        // Handle both single material and array of materials
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        const allTextures = [textures.map, textures.normalMap, textures.roughnessMap];

        allTextures.forEach(tex => {
            if (!tex) return;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(config.textureScale, config.textureScale);
            tex.rotation = (config.textureRotation * Math.PI) / 180;
            // GLTF textures usually need flipY = false
            tex.flipY = false;
            tex.anisotropy = 16;
            tex.needsUpdate = true;
        });

        materials.forEach((mat) => {
            if (!(mat instanceof THREE.MeshStandardMaterial)) return;

            // Upgrade to MeshPhysicalMaterial for realistic fabric
            const physicalMat = new THREE.MeshPhysicalMaterial();

            // Safe manual transfer of material properties
            physicalMat.color.copy(mat.color);
            physicalMat.roughness = mat.roughness;
            physicalMat.metalness = mat.metalness;
            physicalMat.map = mat.map;
            physicalMat.normalMap = mat.normalMap;
            if (mat.normalScale) physicalMat.normalScale.copy(mat.normalScale);
            physicalMat.roughnessMap = mat.roughnessMap;
            physicalMat.metalnessMap = mat.metalnessMap;
            physicalMat.envMap = mat.envMap;
            physicalMat.envMapIntensity = mat.envMapIntensity;

            if (textures.map) {
                textures.map.colorSpace = THREE.SRGBColorSpace;
                physicalMat.map = textures.map;
                physicalMat.color.set('#ffffff');
            }

            if (textures.normalMap && physicalMat.normalScale) {
                physicalMat.normalMap = textures.normalMap;
                const nScale = config.normalScale ?? 1;
                physicalMat.normalScale.set(nScale, nScale);
            }

            if (textures.roughnessMap) {
                physicalMat.roughnessMap = textures.roughnessMap;
            }

            // High-end Fabric Tuning
            physicalMat.roughness = 0.85;
            physicalMat.metalness = 0;
            physicalMat.sheen = 1.0;
            physicalMat.sheenRoughness = 0.5;

            if (physicalMat.sheenColor) {
                physicalMat.sheenColor.set('#ffffff');
            }

            physicalMat.needsUpdate = true;
            mesh.material = physicalMat;
        });

        return () => {
            materials.forEach((mat) => {
                if (!(mat instanceof THREE.MeshStandardMaterial)) return;
                mat.map = null;
                mat.normalMap = null;
                mat.roughnessMap = null;
                mat.needsUpdate = true;
            });
        };
    }, [mesh, textures, config.textureScale, config.textureRotation, config.normalScale]);

    return null;
};

// Helper component for decals
const DecalInstance = ({ decal, scene }: { decal: any; scene: THREE.Group }) => {
    const texture = useTexture(decal.imageUrl) as THREE.Texture;
    const targetMesh = scene.getObjectByName(decal.targetMesh) as THREE.Mesh;

    if (!targetMesh) return null;

    return (
        <DreiDecal
            mesh={targetMesh as any}
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
        >
            <meshStandardMaterial
                map={texture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
            />
        </DreiDecal>
    );
};

export default ProductModel;
