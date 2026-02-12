import { useThree } from '@react-three/fiber';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addPartDecal, updatePartDecal, setEditingDecal, setPlacementMode, generateUniqueId } from '../../store/productSlice';
import * as THREE from 'three';
import { useEffect } from 'react';
import { useControlsRef } from '../../contexts/ControlsContext';

/**
 * PHASE 4: INTUITIVE SURFACE PLACEMENT + ORBIT COORDINATION
 */
const DecalControls = () => {
    const { raycaster, camera, scene, gl } = useThree();
    const dispatch = useDispatch();
    const { isPlacingDecal, selectedPart, parts, editingDecalId } = useSelector((state: RootState) => state.product);
    const orbitRef = useControlsRef();

    // Handle interactive placement & movement
    useEffect(() => {
        // Only run if we are in placement mode OR adjusting an existing decal
        if (!isPlacingDecal && !editingDecalId) return;

        const handlePointerDown = (event: PointerEvent) => {
            // Disable Orbit while we are interacting with the surface
            if (orbitRef?.current) orbitRef.current.enabled = false;

            const rect = gl.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const mouse = new THREE.Vector2(x, y);
            raycaster.setFromCamera(mouse, camera);

            // Intersect only the product model group
            const productRoot = scene.getObjectByName('Boxing-shorts-copy.glb') || scene;
            const intersects = raycaster.intersectObject(productRoot, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                if (!(hit.object instanceof THREE.Object3D) || !hit.face) {
                    // Re-enable if we hit nothing valid
                    if (orbitRef?.current) orbitRef.current.enabled = true;
                    return;
                }

                // --- REQUIREMENT 2 & 3: Resolve and prefer actual mesh ancestor ---
                let meshNode: THREE.Object3D | null = hit.object;

                // Climb ancestor chain until we find a Mesh
                while (meshNode && !(meshNode as any).isMesh && meshNode.parent && meshNode !== scene) {
                    meshNode = meshNode.parent;
                }

                if (!meshNode || !(meshNode as any).isMesh) {
                    console.warn('[DecalControls] No valid mesh found in ancestor chain — aborting placement');
                    if (orbitRef?.current) orbitRef.current.enabled = true;
                    return;
                }

                const mesh = meshNode as THREE.Mesh;
                const meshName = mesh.name || '';
                const meshUuid = mesh.uuid;

                // Resolve part name for Redux state structure (climb for named part)
                let resolvedPartName = meshName || '';
                let searchNode: THREE.Object3D | null = mesh;
                while (searchNode && (!resolvedPartName || !parts[resolvedPartName]) && searchNode.parent && searchNode !== scene) {
                    searchNode = searchNode.parent;
                    if (searchNode.name && parts[searchNode.name]) {
                        resolvedPartName = searchNode.name;
                    }
                }

                // Final target for state entry
                const finalTargetPart = resolvedPartName || selectedPart || null;

                console.debug('[DecalControls] create/update decal', {
                    targetMeshName: meshName,
                    targetMeshUuid: meshUuid,
                    finalTargetPart: finalTargetPart,
                    hitMeshName: hit.object.name
                });

                if (!finalTargetPart) {
                    console.warn('[DecalControls] No valid target part — aborting placement/reposition');
                    if (orbitRef?.current) orbitRef.current.enabled = true;
                    return;
                }

                // 2. Calculate coordinates relative to the found mesh node (Requirement 2)
                const localPoint = mesh.worldToLocal(hit.point.clone());
                const localNormal = hit.face.normal.clone();

                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    localNormal
                );
                const rotation = new THREE.Euler().setFromQuaternion(quaternion);

                const positionArray: [number, number, number] = [localPoint.x, localPoint.y, localPoint.z];
                const rotationArray: [number, number, number] = [rotation.x, rotation.y, rotation.z];

                // 3. Perform Action
                if (editingDecalId) {
                    // --- REPOSITIONING MODE ---
                    // Prefer name first, then uuid for targetMesh
                    const targetMeshIdentifier = meshName || meshUuid;
                    console.debug(`[DecalControls] Repositioning ${editingDecalId.decalId} to ${targetMeshIdentifier}`);

                    dispatch(updatePartDecal({
                        partName: editingDecalId.partName,
                        decalId: editingDecalId.decalId,
                        updates: {
                            position: positionArray,
                            rotation: rotationArray,
                            targetMesh: targetMeshIdentifier,
                            targetMeshUuid: meshUuid
                        }
                    }));
                } else if (isPlacingDecal) {
                    // --- ADD NEW MODE ---
                    const newId = generateUniqueId('txt');
                    const targetMeshIdentifier = meshName || meshUuid;

                    console.debug(`[DecalControls] Creating decal ${newId} on ${targetMeshIdentifier}`);

                    const newDecal = {
                        id: newId,
                        type: 'text',
                        content: 'NEW TEXT',
                        position: positionArray,
                        rotation: rotationArray,
                        scale: [0.8, 0.8, 0.8] as [number, number, number],
                        targetMesh: targetMeshIdentifier,
                        targetMeshUuid: meshUuid, // Requirement 3
                        fontFamily: 'Inter',
                        fontSize: 128,
                        color: '#ffffff'
                    };

                    dispatch(addPartDecal({ partName: finalTargetPart, decal: newDecal as any }));
                    dispatch(setEditingDecal({ partName: finalTargetPart, decalId: newId }));
                    dispatch(setPlacementMode(false));
                }
            }

            // Re-enable Orbit after the click logic finishes
            if (orbitRef?.current) orbitRef.current.enabled = true;
        };

        gl.domElement.addEventListener('pointerdown', handlePointerDown);
        return () => {
            gl.domElement.removeEventListener('pointerdown', handlePointerDown);
            // Ensure Orbit is always restored on unmount or mode change
            if (orbitRef?.current) orbitRef.current.enabled = true;
        };
    }, [isPlacingDecal, editingDecalId, dispatch, selectedPart, parts, raycaster, camera, gl, scene, orbitRef]);

    return null;
};

export default DecalControls;
