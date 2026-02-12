const Lights = () => {
    return (
        <>
            {/* Front Soft Fill: Provides base illumination from camera side */}
            <directionalLight
                position={[0, 2, 8]}
                intensity={0.6}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />

            {/* Back Rim: Subtle edge definition */}
            <directionalLight
                position={[0, 4, -8]}
                intensity={0.3}
            />

            {/* Left Balance: Soft fill from the side */}
            <directionalLight
                position={[-8, 2, 2]}
                intensity={0.4}
            />

            {/* Right Balance: Soft fill from the other side */}
            <directionalLight
                position={[8, 2, 2]}
                intensity={0.4}
            />

            {/* Top Soft Ambient: Removed as per user feedback (too strong) */}
            {/* <directionalLight
                position={[0, 8, 0]}
                intensity={0.05}
            /> */}

            <ambientLight intensity={0.15} />
        </>
    );
};

export default Lights;
