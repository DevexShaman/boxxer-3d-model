import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Robust unique ID generator for decals
 */
export const generateUniqueId = (prefix: string = 'decal') => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export interface DecalItem {
    id: string;
    type: 'text' | 'image';
    content?: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    stroke?: { width: number; color: string } | null;
    imageUrl?: string;
    position: [number, number, number];
    rotation: [number, number, number]; // Euler radians
    scale: [number, number, number];
    targetMesh: string;
    targetMeshUuid?: string;
}

interface PartCustomization {
    color: string;
    fabricId: string | null;
    maps: {
        map?: string;
        normalMap?: string;
        roughnessMap?: string;
        metalnessMap?: string;
        displacementMap?: string;
        aoMap?: string;
    } | null;
    decals: DecalItem[];
}

interface ProductState {
    productId: string;
    modelUrl: string;
    modelVersion: string;
    parts: Record<string, PartCustomization>;
    selectedPart: string;
    editingDecalId: { partName: string; decalId: string } | null;
    isPlacingDecal: boolean;
    transformMode: 'translate' | 'rotate' | 'scale';
}

const initialState: ProductState = {
    productId: 'boxxer-v1',
    modelUrl: '/models/Boxing-shorts-copy.glb',
    modelVersion: 'v1',
    parts: {
        BX_8_BRIT_CURVED_1_1: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_2: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_3: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_4: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_5: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_6: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
        BX_8_BRIT_CURVED_1_7: { color: '#ffffff', fabricId: null, maps: null, decals: [] },
    },
    selectedPart: 'BX_8_BRIT_CURVED_1_1',
    editingDecalId: null,
    isPlacingDecal: false,
    transformMode: 'translate',
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        selectPart: (state, action: PayloadAction<string>) => {
            state.selectedPart = action.payload;
        },
        setPartColor: (state, action: PayloadAction<{ partName: string; color: string }>) => {
            const { partName, color } = action.payload;
            if (state.parts[partName]) {
                state.parts[partName].color = color;
            }
        },
        setPartFabric: (state, action: PayloadAction<{
            partName: string;
            fabricId: string | null;
            maps: PartCustomization['maps'];
        }>) => {
            const { partName, fabricId, maps } = action.payload;
            if (state.parts[partName]) {
                state.parts[partName].fabricId = fabricId;
                state.parts[partName].maps = maps;
            }
        },
        addPartDecal: (state, action: PayloadAction<{ partName: string; decal: DecalItem }>) => {
            const { partName, decal } = action.payload;

            // Guard: ensure targetMesh is not empty
            if (!decal.targetMesh) {
                decal.targetMesh = partName;
            }

            if (state.parts[partName]) {
                state.parts[partName].decals.push(decal);
                state.editingDecalId = { partName, decalId: decal.id };
                state.isPlacingDecal = false;
            }
        },
        updatePartDecal: (state, action: PayloadAction<{ partName: string; decalId: string; updates: Partial<DecalItem> }>) => {
            const { partName, decalId, updates } = action.payload;

            // Guard: ensure targetMesh update is valid (Requirement E)
            if ('targetMesh' in updates && (!updates.targetMesh || updates.targetMesh === "")) {
                delete updates.targetMesh; // preserve original by ignoring the empty string
            }

            if (state.parts[partName]) {
                const index = state.parts[partName].decals.findIndex(d => d.id === decalId);
                if (index !== -1) {
                    state.parts[partName].decals[index] = { ...state.parts[partName].decals[index], ...updates };
                }
            }
        },
        removePartDecal: (state, action: PayloadAction<{ partName: string; decalId: string }>) => {
            const { partName, decalId } = action.payload;
            if (state.parts[partName]) {
                state.parts[partName].decals = state.parts[partName].decals.filter(d => d.id !== decalId);
                if (state.editingDecalId?.decalId === decalId) {
                    state.editingDecalId = null;
                }
            }
        },
        setEditingDecal: (state, action: PayloadAction<{ partName: string; decalId: string } | null>) => {
            state.editingDecalId = action.payload;
        },
        finishEditingDecal: (state) => {
            state.editingDecalId = null;
        },
        setPlacementMode: (state, action: PayloadAction<boolean>) => {
            state.isPlacingDecal = action.payload;
        },
        setTransformMode: (state, action: PayloadAction<'translate' | 'rotate' | 'scale'>) => {
            state.transformMode = action.payload;
        },
    },
});

export const {
    selectPart,
    setPartColor,
    setPartFabric,
    addPartDecal,
    updatePartDecal,
    removePartDecal,
    setEditingDecal,
    finishEditingDecal,
    setPlacementMode,
    setTransformMode
} = productSlice.actions;
export default productSlice.reducer;
