import { useEffect, Suspense } from 'react';
import { useGLTF, Decal as DreiDecal, useTexture } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import * as THREE from 'three';
import MaterialMapper from './MaterialMapper';

import { Fabric } from '../../utils/parseFabrics';

const ProductModel = ({ allFabrics }: { allFabrics: Fabric[] }) => {
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

    if (!model) return null;

    return (
        <primitive object={model.scene} scale={0.2}>
            {/* Orchestrate material and texture application */}
            <MaterialMapper
                scene={model.scene}
                parts={parts}
                allFabrics={allFabrics}
            />

            {decals.map((decal) => (
                <DecalInstance key={decal.id} decal={decal} scene={model.scene} />
            ))}
        </primitive>
    );
};

/**
 * Internal helper for decals
 */
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
