import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setPartTexture } from '../../store/productSlice';
import { Check, Repeat, RotateCcw, Box } from 'lucide-react';

interface TexturePickerProps {
    partName: string;
    label: string;
}

const TexturePicker = ({ partName, label }: TexturePickerProps) => {
    const dispatch = useDispatch();
    const partConfig = useSelector((state: RootState) => state.product.parts[partName]);
    const currentTexture = partConfig?.texture || null;

    const textures = [
        { id: null, label: 'Standard', color: 'bg-slate-200' },
        { id: 'crepe_satin', label: 'Crepe Satin', color: 'bg-rose-200' },
        { id: 'leather_01', label: 'Leather', color: 'bg-orange-800' },
        { id: 'carbon_01', label: 'Carbon', color: 'bg-slate-800' },
        { id: 'fabric_01', label: 'Fabric', color: 'bg-blue-800' },
    ];

    if (!partConfig) return null;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">{label} Fabric</label>
                    {currentTexture && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                            {currentTexture.replace('_01', '')}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {textures.map((tex) => (
                        <button
                            key={tex.id || 'none'}
                            onClick={() => dispatch(setPartTexture({ partName, texture: tex.id }))}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 border-2 ${currentTexture === tex.id
                                ? 'border-blue-600 bg-white shadow-sm'
                                : 'border-transparent bg-slate-100/50 hover:bg-slate-200/50'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full ${tex.color}`} />
                            <span className={`text-xs font-bold ${currentTexture === tex.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                {tex.label}
                            </span>
                            {currentTexture === tex.id && <Check size={12} className="ml-auto text-blue-600" />}
                        </button>
                    ))}
                </div>
            </div>

            {currentTexture && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
                    {/* Scale / Tiling Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <Repeat size={10} />
                                <span>Pattern Scale</span>
                            </div>
                            <span className="text-blue-600">{partConfig.textureScale.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={partConfig.textureScale}
                            onChange={(e) => dispatch(setPartTexture({
                                partName,
                                texture: currentTexture,
                                textureScale: parseFloat(e.target.value)
                            }))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <RotateCcw size={10} />
                                <span>Rotation</span>
                            </div>
                            <span className="text-blue-600">{partConfig.textureRotation}°</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={partConfig.textureRotation}
                            onChange={(e) => dispatch(setPartTexture({
                                partName,
                                texture: currentTexture,
                                textureRotation: parseInt(e.target.value)
                            }))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Normal Map / Bump Strength */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <Box size={10} />
                                <span>Bump Depth</span>
                            </div>
                            <span className="text-blue-600">{partConfig.normalScale.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={partConfig.normalScale}
                            onChange={(e) => dispatch(setPartTexture({
                                partName,
                                texture: currentTexture,
                                normalScale: parseFloat(e.target.value)
                            }))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TexturePicker;
