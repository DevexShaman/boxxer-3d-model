import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePartDecal, removePartDecal, finishEditingDecal, setTransformMode } from '../../store/productSlice';
import { Image as ImageIcon, Maximize2, Trash2, CheckCircle2, XCircle, Move, RotateCw, Scaling } from 'lucide-react';

/**
 * IMAGE EDITOR PANEL
 * Inline UI for editing image decals in the sidebar.
 */
const ImageEditorPanel = () => {
    const dispatch = useDispatch();
    const { editingDecalId, parts, transformMode } = useSelector((state: RootState) => state.product);

    if (!editingDecalId) return null;

    const { partName, decalId } = editingDecalId;
    const decal = parts[partName]?.decals.find(d => d.id === decalId);

    if (!decal || decal.type !== 'image') return null;

    const handleUpdate = (updates: any) => {
        dispatch(updatePartDecal({ partName, decalId, updates }));
    };

    const handleDelete = () => {
        dispatch(removePartDecal({ partName, decalId }));
    };

    const handleSave = () => {
        dispatch(finishEditingDecal());
    };

    return (
        <div className="bg-purple-50/30 border border-purple-100 rounded-2xl p-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2">
                    <ImageIcon className="text-purple-600" size={16} />
                    <h3 className="font-bold text-sm text-slate-800">Edit Selected Logo</h3>
                </div>

                {/* Transform Mode Switcher */}
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button
                        onClick={() => dispatch(setTransformMode('translate'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'translate' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Move (G)"
                    >
                        <Move size={14} />
                    </button>
                    <button
                        onClick={() => dispatch(setTransformMode('rotate'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'rotate' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Rotate (R)"
                    >
                        <RotateCw size={14} />
                    </button>
                    <button
                        onClick={() => dispatch(setTransformMode('scale'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'scale' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Scale (S)"
                    >
                        <Scaling size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Image Preview Thumbnail */}
                <div className="flex items-center gap-4 bg-white/50 p-3 rounded-xl border border-purple-100/50">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                        <img
                            src={decal.imageUrl}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Source</p>
                        <p className="text-xs font-bold text-slate-700">Custom Upload</p>
                        <button
                            className="text-[10px] font-bold text-purple-600 hover:underline mt-1"
                            onClick={() => document.getElementById('logo-upload-input')?.click()}
                        >
                            Change Image
                        </button>
                    </div>
                </div>

                {/* 3D Scale Slider */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Maximize2 size={12} className="rotate-45" />
                            Logo Scale
                        </label>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 rounded">
                            {(decal.scale[0]).toFixed(2)}x
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.05"
                        max="2"
                        step="0.01"
                        value={decal.scale[0]}
                        onChange={(e) => {
                            const s = parseFloat(e.target.value);
                            handleUpdate({ scale: [s, s, s] });
                        }}
                        className="w-full accent-purple-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                    >
                        <CheckCircle2 size={16} />
                        Save Logo Design
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[11px] font-bold transition-all"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-[11px] font-bold transition-all"
                        >
                            <XCircle size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center mt-3 italic">
                Tip: Click anywhere on {partName} to reposition the logo.
            </p>
        </div>
    );
};

export default ImageEditorPanel;
