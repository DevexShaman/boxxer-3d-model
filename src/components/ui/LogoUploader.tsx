import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addDecal } from '../../store/productSlice';
import { Image as ImageIcon, Plus, X, Command } from 'lucide-react';

const LogoUploader = () => {
    const dispatch = useDispatch();
    const [previews, setPreviews] = useState<{ id: string, url: string }[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const id = Math.random().toString(36).substr(2, 9);
            setPreviews(prev => [...prev, { id, url }]);

            dispatch(addDecal({
                id,
                imageUrl: url,
                targetMesh: 'LogoArea',
                position: [0, 0.2, 0.5],
                scale: 0.5,
                rotation: 0,
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">Active Decals</label>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Command size={10} />
                    <span>Upload SVG/PNG</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {previews.map((preview) => (
                    <div key={preview.id} className="relative group aspect-square rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                        <img src={preview.url} alt="Logo preview" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => setPreviews(prev => prev.filter(p => p.id !== preview.id))}
                                className="bg-white/20 backdrop-blur-md text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                                title="Remove decal"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                    <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
            </div>

            {!previews.length && (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm mb-3">
                        <ImageIcon className="text-slate-300 w-6 h-6" />
                    </div>
                    <p className="text-slate-400 text-xs font-medium px-6">Upload your brand logo to see it applied to the product in real-time.</p>
                </div>
            )}
        </div>
    );
};

export default LogoUploader;
