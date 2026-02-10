import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';

const CameraControls = () => {
    return (
        <OrbitControls
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
