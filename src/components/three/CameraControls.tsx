import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useControlsRef } from '../../contexts/ControlsContext';

const CameraControls = () => {
    const orbitRef = useRef<any>(null);
    const contextRef = useControlsRef();

    useEffect(() => {
        if (contextRef && orbitRef.current) {
            (contextRef as any).current = orbitRef.current;
        }
    }, [contextRef]);

    return (
        <OrbitControls
            ref={orbitRef}
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.75}
            minDistance={0.5}
            maxDistance={10}
            enableDamping={true}
            dampingFactor={0.05}
        />
    );
};

export default CameraControls;
