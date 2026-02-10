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
    texture: string | null;
    textureScale: number;
    textureRotation: number;
    textureOffset: [number, number];
    normalScale: number;
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
}

const initialState: ProductState = {
    productId: 'boxxer-v1',
    modelUrl: '/models/Boxing-shorts-copy.glb',
    modelVersion: 'v1',
    parts: {
        BX_8_BRIT_CURVED_1_1: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_2: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_3: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_4: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_5: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_6: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
        BX_8_BRIT_CURVED_1_7: { color: '#ffffff', texture: null, textureScale: 1, textureRotation: 0, textureOffset: [0, 0], normalScale: 1 },
    },
    decals: [],
    text: {
        value: '',
        color: '#000000',
        targetMesh: 'BX_8_BRIT_CURVED_1_1',
    },
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setPartColor: (state, action: PayloadAction<{ partName: string; color: string }>) => {
            const { partName, color } = action.payload;
            if (state.parts[partName]) {
                state.parts[partName].color = color;
            }
        },
        setPartTexture: (state, action: PayloadAction<{
            partName: string;
            texture: string | null;
            textureScale?: number;
            textureRotation?: number;
            normalScale?: number;
        }>) => {
            const { partName, texture, textureScale, textureRotation, normalScale } = action.payload;
            if (state.parts[partName]) {
                state.parts[partName].texture = texture;
                if (textureScale !== undefined) state.parts[partName].textureScale = textureScale;
                if (textureRotation !== undefined) state.parts[partName].textureRotation = textureRotation;
                if (normalScale !== undefined) state.parts[partName].normalScale = normalScale;
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

export const { setPartColor, setPartTexture, addDecal, removeDecal, updateText } = productSlice.actions;
export default productSlice.reducer;
