const Lights = () => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <spotLight
                position={[5, 10, 5]}
                angle={0.15}
                penumbra={1}
                intensity={2}
                castShadow
            />
            <directionalLight position={[-5, 5, 5]} intensity={1} />
            <pointLight position={[0, -5, 5]} intensity={0.5} />
        </>
    );
};

export default Lights;
