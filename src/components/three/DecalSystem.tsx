import React, { useMemo, useState, useEffect } from 'react';
import { Decal as DreiDecal, useTexture, TransformControls } from '@react-three/drei';
import { createPortal, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { DecalItem, setEditingDecal, updatePartDecal } from '../../store/productSlice';
import { createTextCanvas } from '../../utils/TextureUtils';
import { useControlsRef } from '../../contexts/ControlsContext';

interface DecalSystemProps {
    scene: THREE.Group;
}

/**
 * SIMPLE ERROR BOUNDARY
 * Captures projection errors locally so they don't crash the entire Three scene.
 */
class SimpleErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error) {
        console.warn('[DecalSystem] Caught projection error:', error.message);
    }
    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

/**
 * USE MESH READY HOOK
 * Polls the scene until the target mesh AND its geometry are verified as ready.
 * Reactive and robust for slow-loading GLTF models.
 */
function useMeshReady(meshMap: Map<string, THREE.Mesh>, decal: DecalItem, scene: THREE.Group) {
    const [readyMesh, setReadyMesh] = React.useState<THREE.Mesh | null>(null);

    React.useEffect(() => {
        // Helper that looks up canonical mesh from the renderer scene first
        const findInScene = () => {
            try {
                // Prefer UUID (most robust)
                if (decal.targetMeshUuid) {
                    const byUuid = scene.getObjectByProperty('uuid', decal.targetMeshUuid) as THREE.Object3D | undefined;
                    if (byUuid && (byUuid as any).isMesh && (byUuid as THREE.Mesh).geometry) return byUuid as THREE.Mesh;
                }

                // Then try name lookup on the canonical scene
                if (decal.targetMesh) {
                    const byName = scene.getObjectByName(decal.targetMesh) as THREE.Object3D | undefined;
                    if (byName && (byName as any).isMesh && (byName as THREE.Mesh).geometry) return byName as THREE.Mesh;
                }
            } catch (err) {
                // ignore lookup exceptions
            }

            // Fallback: use meshMap (useful if the scene getter isn't available yet)
            const fallback = meshMap.get(decal.targetMesh) || (decal.targetMeshUuid ? meshMap.get(decal.targetMeshUuid) : undefined);
            if (fallback && (fallback as any).isMesh && (fallback as THREE.Mesh).geometry) return fallback as THREE.Mesh;

            return null;
        };

        const initial = findInScene();
        if (initial) {
            // Debug: check that scene-found object === meshMap object (if both exist)
            const mapMesh = meshMap.get(decal.targetMesh) || (decal.targetMeshUuid ? meshMap.get(decal.targetMeshUuid) : undefined);
            if (mapMesh && mapMesh !== initial) {
                console.debug('[DecalSystem] scene mesh !== meshMap entry (identity mismatch)', {
                    decalId: decal.id,
                    sceneMesh: { name: initial.name, uuid: initial.uuid },
                    mapMesh: mapMesh ? { name: mapMesh.name, uuid: mapMesh.uuid } : null
                });
            }
            setReadyMesh(initial);
            return;
        }

        // Poll every 50ms if not ready
        const interval = setInterval(() => {
            const found = findInScene();
            if (found) {
                console.debug('[DecalSystem] readyMesh set for', decal.id, found.name || found.uuid);
                setReadyMesh(found);
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [meshMap, decal.targetMesh, decal.targetMeshUuid, decal.id, scene]);

    return readyMesh;
}

/**
 * ROBUST DECAL SYSTEM
 * Fixed: React key warnings, Portal parenting errors, and Mesh guards.
 */
const DecalSystem = ({ scene }: DecalSystemProps) => {
    const { parts } = useSelector((state: RootState) => state.product);
    const [isSceneReady, setIsSceneReady] = useState(false);

    const meshMap = useMemo(() => {
        const map = new Map<string, THREE.Mesh>();
        if (!scene) return map;

        scene.traverse((child) => {
            if ((child as any).isMesh) {
                const m = child as THREE.Mesh;
                if (m.name) map.set(m.name, m);
                map.set(m.uuid, m); // Support UUID lookup
            }
        });
        return map;
    }, [scene]);

    useEffect(() => {
        const timer = setTimeout(() => setIsSceneReady(true), 50);
        return () => clearTimeout(timer);
    }, [scene]);

    const allDecals = useMemo(() => {
        return Object.entries(parts).flatMap(([partName, part]) =>
            part.decals.map(decal => ({ ...decal, partName }))
        );
    }, [parts]);

    if (!isSceneReady || !scene) return null;

    return (
        <group name="decal-manager">
            {allDecals.map((decal) => {
                const target =
                    meshMap.get(decal.targetMesh) ||
                    (decal.targetMeshUuid
                        ? meshMap.get(decal.targetMeshUuid)
                        : undefined);

                if (target && (target as any).isMesh) {
                    return (
                        <SimpleErrorBoundary key={decal.id}>
                            <DecalInstance
                                decal={decal}
                                mesh={target as THREE.Mesh}
                                meshMap={meshMap}
                                scene={scene}
                            />
                        </SimpleErrorBoundary>
                    );
                }

                return null;
            })}
        </group>
    );
};

interface DecalInstanceProps {
    decal: DecalItem & { partName: string };
    mesh?: THREE.Mesh;
    meshMap: Map<string, THREE.Mesh>;
    scene: THREE.Group;
}

/**
 * PLANE DECAL (Fallback)
 * Renders a simple plane when the target mesh is invalid.
 */
const PlaneDecal = ({ decal, scene }: { decal: DecalItem; scene: THREE.Group }) => {
    const { editingDecalId } = useSelector((state: RootState) => state.product);
    const isEditing = editingDecalId?.decalId === decal.id;

    const texture = useMemo(() => {
        if (decal.type === 'image') {
            const loader = new THREE.TextureLoader();
            return loader.load(decal.imageUrl || '');
        } else {
            const canvas = createTextCanvas({
                text: decal.content || '',
                fontFamily: decal.fontFamily,
                fontSize: decal.fontSize,
                color: decal.color,
                stroke: decal.stroke
            });
            return new THREE.CanvasTexture(canvas);
        }
    }, [decal]);

    useEffect(() => {
        return () => {
            if (texture) texture.dispose();
        };
    }, [texture]);

    return (
        <mesh
            position={new THREE.Vector3(...decal.position).add(new THREE.Vector3(0, 0, 0.01))}
            rotation={new THREE.Euler(...decal.rotation)}
            scale={decal.scale}
        >
            <planeGeometry args={[1, 1]} />
            <meshPhysicalMaterial
                map={texture}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-10}
                emissive={isEditing ? new THREE.Color('#3b82f6') : new THREE.Color('#000000')}
                emissiveIntensity={isEditing ? 0.5 : 0}
            />
        </mesh>
    );
};

const DecalInstance = ({ decal, mesh, meshMap, scene }: DecalInstanceProps) => {
    if (decal.type === 'text') {
        return <TextDecal decal={decal} mesh={mesh} meshMap={meshMap} scene={scene} />;
    }
    return <ImageDecal decal={decal} mesh={mesh} meshMap={meshMap} scene={scene} />;
};

const TextDecal = ({ decal, mesh, meshMap, scene }: DecalInstanceProps) => {
    const dispatch = useDispatch();
    const { raycaster } = useThree();
    const orbitRef = useControlsRef();
    const { editingDecalId, transformMode } = useSelector((state: RootState) => state.product);
    const isEditing = editingDecalId?.decalId === decal.id;
    // Use a ref for the Mesh inside DreiDecal (which is inside the portal)
    const decalRef = React.useRef<THREE.Mesh>(null);

    const textTex = useMemo(() => {
        const canvas = createTextCanvas({
            text: decal.content || '',
            fontFamily: decal.fontFamily,
            fontSize: decal.fontSize,
            color: decal.color,
            stroke: decal.stroke
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        return tex;
    }, [decal.content, decal.fontFamily, decal.fontSize, decal.color, decal.stroke]);

    useEffect(() => {
        return () => { textTex.dispose(); };
    }, [textTex]);

    // Handle gizmo movement
    const onTransformChange = (e?: any) => {
        if (!e || !e.target || !isEditing || !mesh) return;
        const object = e.target.object as THREE.Object3D;
        const worldPos = new THREE.Vector3();
        object.getWorldPosition(worldPos);

        const direction = new THREE.Vector3().subVectors(mesh.getWorldPosition(new THREE.Vector3()), worldPos).normalize();
        raycaster.set(worldPos.clone().add(direction.clone().multiplyScalar(-0.5)), direction);

        const intersects = raycaster.intersectObject(mesh, false);
        if (intersects.length > 0) {
            const hit = intersects[0];
            const localPoint = mesh.worldToLocal(hit.point.clone());
            const localNormal = hit.face?.normal.clone() || new THREE.Vector3(0, 0, 1);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), localNormal);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);

            dispatch(updatePartDecal({
                partName: decal.partName,
                decalId: decal.id,
                updates: {
                    position: [localPoint.x, localPoint.y, localPoint.z],
                    rotation: [rotation.x, rotation.y, rotation.z],
                    scale: [object.scale.x, object.scale.y, object.scale.z]
                }
            }));
        }
    };

    // v5: Reactive Verification
    const readyMesh = useMeshReady(meshMap, decal, scene);

    console.debug('[TextDecal] mount-check', {
        decalId: decal.id,
        meshProp: !!mesh,
        readyMesh: !!readyMesh,
        geometry: readyMesh ? !!readyMesh.geometry : null
    });

    if (!readyMesh ||
        !(readyMesh as any).isMesh ||
        !readyMesh.geometry
    ) {
        return null;
    }

    // Portal the Decal into the Mesh so it is a true child
    return createPortal(
        <>
            <DreiDecal
                ref={decalRef}
                position={decal.position}
                rotation={decal.rotation}
                scale={decal.scale}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setEditingDecal({ partName: decal.partName, decalId: decal.id }));
                }}
            >
                <meshPhysicalMaterial
                    map={textTex}
                    transparent
                    polygonOffset
                    polygonOffsetFactor={-10}
                    roughness={0.7}
                    metalness={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    emissive={isEditing ? new THREE.Color('#3b82f6') : new THREE.Color('#000000')}
                    emissiveIntensity={isEditing ? 0.5 : 0}
                />
            </DreiDecal>

            {isEditing && decalRef.current && (
                <TransformControls
                    mode={transformMode}
                    object={decalRef.current}
                    onObjectChange={onTransformChange}
                    onMouseDown={() => { if (orbitRef?.current) orbitRef.current.enabled = false; }}
                    onMouseUp={() => { if (orbitRef?.current) orbitRef.current.enabled = true; }}
                    size={0.6}
                />
            )}
        </>,
        readyMesh
    );
};

const ImageDecal = ({ decal, mesh, meshMap, scene }: DecalInstanceProps) => {
    const dispatch = useDispatch();
    const { raycaster } = useThree();
    const orbitRef = useControlsRef();
    const { editingDecalId, transformMode } = useSelector((state: RootState) => state.product);
    const isEditing = editingDecalId?.decalId === decal.id;
    // Use a ref for the Mesh inside DreiDecal
    const decalRef = React.useRef<THREE.Mesh>(null);

    const texture = useTexture(decal.imageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    const onTransformChange = (e?: any) => {
        if (!e || !e.target || !isEditing || !mesh) return;
        const object = e.target.object as THREE.Object3D;
        const worldPos = new THREE.Vector3();
        object.getWorldPosition(worldPos);

        const direction = new THREE.Vector3().subVectors(mesh.getWorldPosition(new THREE.Vector3()), worldPos).normalize();
        raycaster.set(worldPos.clone().add(direction.clone().multiplyScalar(-0.5)), direction);

        const intersects = raycaster.intersectObject(mesh, false);
        if (intersects.length > 0) {
            const hit = intersects[0];
            const localPoint = mesh.worldToLocal(hit.point.clone());
            const localNormal = hit.face?.normal.clone() || new THREE.Vector3(0, 0, 1);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), localNormal);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);

            dispatch(updatePartDecal({
                partName: decal.partName,
                decalId: decal.id,
                updates: {
                    position: [localPoint.x, localPoint.y, localPoint.z],
                    rotation: [rotation.x, rotation.y, rotation.z],
                    scale: [object.scale.x, object.scale.y, object.scale.z]
                }
            }));
        }
    };

    // v5: Reactive Verification
    const readyMesh = useMeshReady(meshMap, decal, scene);

    console.debug('[ImageDecal] mount-check', {
        decalId: decal.id,
        meshProp: !!mesh,
        readyMesh: !!readyMesh,
        geometry: readyMesh ? !!readyMesh.geometry : null
    });

    if (!readyMesh ||
        !(readyMesh as any).isMesh ||
        !readyMesh.geometry
    ) {
        return null; // Hard guard
    }

    return createPortal(
        <>
            <DreiDecal
                ref={decalRef}
                position={decal.position}
                rotation={decal.rotation}
                scale={decal.scale}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setEditingDecal({ partName: decal.partName, decalId: decal.id }));
                }}
            >
                <meshPhysicalMaterial
                    map={texture}
                    transparent
                    polygonOffset
                    polygonOffsetFactor={-10}
                    roughness={0.7}
                    metalness={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    emissive={isEditing ? new THREE.Color('#3b82f6') : new THREE.Color('#000000')}
                    emissiveIntensity={isEditing ? 0.5 : 0}
                />
            </DreiDecal>

            {isEditing && decalRef.current && (
                <TransformControls
                    mode={transformMode}
                    object={decalRef.current}  // <-- important
                    onObjectChange={onTransformChange}
                    onMouseDown={() => { if (orbitRef?.current) orbitRef.current.enabled = false; }}
                    onMouseUp={() => { if (orbitRef?.current) orbitRef.current.enabled = true; }}
                    size={0.6}
                />
            )}
        </>,
        readyMesh
    );
};

export default DecalSystem;
