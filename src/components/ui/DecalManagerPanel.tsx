import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setEditingDecal, removePartDecal, selectPart } from '../../store/productSlice';
import { Type, Image as ImageIcon, Trash2, ChevronRight } from 'lucide-react';

/**
 * DECAL MANAGER PANEL
 * Lists all decals added to the model (across all parts) with quick actions.
 */
const DecalManagerPanel = () => {
    const dispatch = useDispatch();
    const { parts, editingDecalId } = useSelector((state: RootState) => state.product);

    // Aggregate all decals from all parts
    const allDecals = Object.entries(parts).flatMap(([partName, part]) =>
        part.decals.map(decal => ({ ...decal, partName }))
    );

    if (allDecals.length === 0) return (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center mt-6">
            <p className="text-sm font-medium text-slate-400 italic">No decals added yet.</p>
        </div>
    );

    return (
        <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Added Designs ({allDecals.length})
                </label>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {allDecals.map((decal) => {
                    const isEditing = editingDecalId?.decalId === decal.id;

                    const handleSelect = () => {
                        dispatch(selectPart(decal.partName));
                        dispatch(setEditingDecal({ partName: decal.partName, decalId: decal.id }));
                    };

                    const handleDelete = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        dispatch(removePartDecal({ partName: decal.partName, decalId: decal.id }));
                    };

                    return (
                        <div
                            key={decal.id}
                            onClick={handleSelect}
                            className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isEditing
                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100 shadow-sm'
                                : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                    }`}>
                                    {decal.type === 'text' ? <Type size={16} /> : <ImageIcon size={16} />}
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                                        {decal.type === 'text' ? (decal.content || 'Untitled Text') : 'Logo Image'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                                            {decal.partName.replace(/_/g, ' ')}
                                        </p>
                                        {decal.type === 'text' && (
                                            <div
                                                className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-xs"
                                                style={{ backgroundColor: decal.color }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Decal"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="text-slate-300">
                                    <ChevronRight size={14} />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-full shadow-lg shadow-blue-500/40" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DecalManagerPanel;
