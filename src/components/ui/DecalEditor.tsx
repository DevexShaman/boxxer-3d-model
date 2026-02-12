import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
    setPlacementMode,
    addPartDecal,
    setEditingDecal,
    generateUniqueId
} from '../../store/productSlice';
import { Type, Image as ImageIcon, MousePointer2 } from 'lucide-react';
import DecalManagerPanel from './DecalManagerPanel';

/**
 * DECAL EDITOR
 * Unified entry point for adding Text and Image decals.
 * Integrates DecalManagerPanel for listing existing designs.
 */
const DecalEditor = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { selectedPart, isPlacingDecal, editingDecalId } = useSelector((state: RootState) => state.product);

    const togglePlacementMode = () => {
        dispatch(setPlacementMode(!isPlacingDecal));
    };

    const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const newId = generateUniqueId('img');

                // Add as image decal
                dispatch(addPartDecal({
                    partName: selectedPart,
                    decal: {
                        id: newId,
                        type: 'image',
                        imageUrl,
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        scale: [0.5, 0.5, 0.5],
                        targetMesh: selectedPart,
                    } as any
                }));

                dispatch(setPlacementMode(true));
                dispatch(setEditingDecal({ partName: selectedPart, decalId: newId }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                {/* Add Text Button - Always available for multi-text support */}
                <button
                    onClick={togglePlacementMode}
                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all shadow-xl border-2 ${isPlacingDecal
                            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/40 ring-4 ring-blue-500/10'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100 hover:border-blue-200'
                        }`}
                >
                    <div className={`p-3 rounded-2xl ${isPlacingDecal ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                        {isPlacingDecal ? <MousePointer2 size={24} /> : <Type size={24} />}
                    </div>
                    <span className="text-[11px] uppercase tracking-widest leading-tight">
                        {isPlacingDecal ? 'Placing...' : 'Add Text'}
                    </span>
                </button>

                {/* Add Logo Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl font-bold transition-all bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-100 hover:border-purple-200 shadow-xl"
                >
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 font-black">
                        <ImageIcon size={24} />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest leading-tight">Add Logo</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAddImage}
                        accept="image/*"
                        className="hidden"
                    />
                </button>
            </div>

            {isPlacingDecal && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 shadow-xl shadow-blue-500/30">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <p className="text-xs font-black text-white uppercase tracking-widest">
                        Click on the model piece to place
                    </p>
                </div>
            )}

            {/* Manager Panel - Shows list of all items */}
            <DecalManagerPanel />
        </div>
    );
};

export default DecalEditor;
