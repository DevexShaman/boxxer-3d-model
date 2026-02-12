import { useEffect, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import * as THREE from 'three';
import MaterialMapper from './MaterialMapper';
import DecalSystem from './DecalSystem';

import { Fabric } from '../../utils/parseFabrics';

const ProductModel = ({ allFabrics }: { allFabrics: Fabric[] }) => {
    const { modelUrl, parts } = useSelector((state: RootState) => state.product);
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

            {/* Advanced 360° Text & Logo Decal System */}
            <DecalSystem scene={model.scene} />
        </primitive>
    );
};

export default ProductModel;
