import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setPartColor } from '../../store/productSlice';
import { Check } from 'lucide-react';

interface ColorPickerProps {
    partName: string;
    label: string;
}

const ColorPicker = ({ partName, label }: ColorPickerProps) => {
    const dispatch = useDispatch();
    const currentColor = useSelector((state: RootState) => state.product.parts[partName]?.color || '#ffffff');

    const colors = [
        { value: '#ffffff', label: 'White' },
        { value: '#1e293b', label: 'Slate' },
        { value: '#ef4444', label: 'Crimson' },
        { value: '#3b82f6', label: 'Azure' },
        { value: '#10b981', label: 'Emerald' },
        { value: '#f59e0b', label: 'Amber' },
        { value: '#8b5cf6', label: 'Violet' },
        { value: '#ec4899', label: 'Pink' },
    ];

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">{label}</label>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{currentColor}</span>
            </div>
            <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        className={`relative w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center shadow-sm ${currentColor.toLowerCase() === color.value.toLowerCase()
                                ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
                                : 'hover:ring-2 hover:ring-slate-200 hover:ring-offset-1'
                            }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => dispatch(setPartColor({ partName, color: color.value }))}
                        title={color.label}
                    >
                        {currentColor.toLowerCase() === color.value.toLowerCase() && (
                            <Check size={16} className={['#ffffff', '#f59e0b'].includes(color.value) ? 'text-slate-900' : 'text-white'} />
                        )}
                    </button>
                ))}

                {/* Custom Color Pipette */}
                <div className="relative group">
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => dispatch(setPartColor({ partName, color: e.target.value }))}
                        className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                        <span className="text-xl">+</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
