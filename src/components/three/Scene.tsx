import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import Lights from './Lights';
import CameraControls from './CameraControls';
import ProductModel from './ProductModel';
import DecalControls from './DecalControls';
import ControlsContext from '../../contexts/ControlsContext';

import { Fabric } from '../../utils/parseFabrics';

const Scene = ({ allFabrics }: { allFabrics: Fabric[] }) => {
    const orbitRef = useRef<any>(null);

    return (
        <ControlsContext.Provider value={orbitRef}>
            <Canvas
                shadows
                camera={{ position: [0, 0.5, 6], fov: 35 }}
                gl={{
                    preserveDrawingBuffer: true,
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.0,
                    outputColorSpace: THREE.SRGBColorSpace
                }}
                className="bg-gradient-to-br from-slate-100 to-slate-200"
            >
                <Suspense fallback={null}>
                    <Lights />

                    <Environment
                        preset="studio"
                        environmentIntensity={0.05}
                    />

                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <ProductModel allFabrics={allFabrics} />
                    </Float>

                    <ContactShadows
                        position={[0, -0.8, 0]}
                        opacity={0.15}
                        scale={10}
                        blur={3}
                        far={1}
                    />

                    <CameraControls />
                    <DecalControls />
                </Suspense>

                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </ControlsContext.Provider>
    );
};

export default Scene;
