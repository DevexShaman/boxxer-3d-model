import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePartDecal, removePartDecal, finishEditingDecal, setTransformMode } from '../../store/productSlice';
import { Type, Maximize2, Trash2, CheckCircle2, XCircle, Move, RotateCw, Scaling } from 'lucide-react';

/**
 * TEXT EDITOR PANEL
 * Inline UI for editing text decals in the sidebar.
 */
const TextEditorPanel = () => {
    const dispatch = useDispatch();
    const { editingDecalId, parts, transformMode } = useSelector((state: RootState) => state.product);

    if (!editingDecalId) return null;

    const { partName, decalId } = editingDecalId;
    const decal = parts[partName]?.decals.find(d => d.id === decalId);

    if (!decal || decal.type !== 'text') return null;

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
        <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2">
                    <Type className="text-blue-600" size={16} />
                    <h3 className="font-bold text-sm text-slate-800">Edit Selected Text</h3>
                </div>

                {/* Transform Mode Switcher */}
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button
                        onClick={() => dispatch(setTransformMode('translate'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'translate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Move (G)"
                    >
                        <Move size={14} />
                    </button>
                    <button
                        onClick={() => dispatch(setTransformMode('rotate'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'rotate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Rotate (R)"
                    >
                        <RotateCw size={14} />
                    </button>
                    <button
                        onClick={() => dispatch(setTransformMode('scale'))}
                        className={`p-1.5 rounded-md transition-all ${transformMode === 'scale' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Scale (S)"
                    >
                        <Scaling size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Text Content */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Message</label>
                    <textarea
                        value={decal.content || ''}
                        onChange={(e) => handleUpdate({ content: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                        placeholder="Enter text..."
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Font Size (Resolution) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Maximize2 size={12} />
                                Resolution
                            </label>
                            <span className="text-[10px] font-bold text-blue-600">
                                {decal.fontSize}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="32"
                            max="512"
                            step="2"
                            value={decal.fontSize || 128}
                            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
                            className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                        />
                    </div>

                    {/* 3D Scale (Actual Size) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Maximize2 size={12} className="rotate-45" />
                                3D Scale
                            </label>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">
                                {(decal.scale[0]).toFixed(2)}x
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="4"
                            step="0.05"
                            value={decal.scale[0]}
                            onChange={(e) => {
                                const s = parseFloat(e.target.value);
                                handleUpdate({ scale: [s, s, s] });
                            }}
                            className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                        />
                    </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Text Color</label>
                    <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl">
                        <input
                            type="color"
                            value={decal.color || '#ffffff'}
                            onChange={(e) => handleUpdate({ color: e.target.value })}
                            className="w-8 h-8 rounded-lg border-none cursor-pointer overflow-hidden p-0"
                        />
                        <input
                            type="text"
                            value={decal.color || '#ffffff'}
                            onChange={(e) => handleUpdate({ color: e.target.value })}
                            className="flex-1 text-xs font-mono uppercase focus:outline-none"
                            placeholder="#FFFFFF"
                        />
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        <CheckCircle2 size={16} />
                        Save Text Design
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
                            onClick={handleSave} // Cancel acts like save in this context (stops editing)
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-[11px] font-bold transition-all"
                        >
                            <XCircle size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center mt-3 italic">
                Tip: Click anywhere on {partName} to reposition the text.
            </p>
        </div>
    );
};

export default TextEditorPanel;
