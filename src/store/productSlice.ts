import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Decal {
    id: string;
    imageUrl: string;
    targetMesh: string;
    position: [number, number, number];
    scale: number;
    rotation: number;
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
}

interface ProductState {
    productId: string;
    modelUrl: string;
    modelVersion: string;
    parts: Record<string, PartCustomization>;
    decals: Decal[];
    text: {
        value: string;
        color: string;
        targetMesh: string;
    };
    selectedPart: string;
}

const initialState: ProductState = {
    productId: 'boxxer-v1',
    modelUrl: '/models/Boxing-shorts-copy.glb',
    modelVersion: 'v1',
    parts: {
        BX_8_BRIT_CURVED_1_1: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_2: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_3: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_4: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_5: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_6: { color: '#ffffff', fabricId: null, maps: null },
        BX_8_BRIT_CURVED_1_7: { color: '#ffffff', fabricId: null, maps: null },
    },
    decals: [],
    text: {
        value: '',
        color: '#000000',
        targetMesh: 'BX_8_BRIT_CURVED_1_1',
    },
    selectedPart: 'BX_8_BRIT_CURVED_1_1',
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
        addDecal: (state, action: PayloadAction<Decal>) => {
            state.decals.push(action.payload);
        },
        removeDecal: (state, action: PayloadAction<string>) => {
            state.decals = state.decals.filter((d) => d.id !== action.payload);
        },
        updateText: (state, action: PayloadAction<{ value: string; color?: string; targetMesh?: string }>) => {
            state.text = { ...state.text, ...action.payload };
        },
    },
});

export const {
    selectPart,
    setPartColor,
    setPartFabric,
    addDecal,
    removeDecal,
    updateText
} = productSlice.actions;
export default productSlice.reducer;
