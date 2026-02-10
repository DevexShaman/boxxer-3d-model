import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectPart } from '../../store/productSlice';
import { ChevronRight } from 'lucide-react';

const PartSelector = () => {
    const dispatch = useDispatch();
    const selectedPart = useSelector((state: RootState) => state.product.selectedPart);
    const parts = useSelector((state: RootState) => state.product.parts);

    const partLabels: Record<string, string> = {
        BX_8_BRIT_CURVED_1_1: 'Main Body',
        BX_8_BRIT_CURVED_1_2: 'Waistband',
        BX_8_BRIT_CURVED_1_3: 'Left Side Panel',
        BX_8_BRIT_CURVED_1_4: 'Right Side Panel',
        BX_8_BRIT_CURVED_1_5: 'Bottom Trim',
        BX_8_BRIT_CURVED_1_6: 'Waistband Logo Area',
        BX_8_BRIT_CURVED_1_7: 'Inner Lining',
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-tight">Select Part</label>
            <div className="grid gap-2">
                {Object.keys(parts).map((partId) => (
                    <button
                        key={partId}
                        onClick={() => dispatch(selectPart(partId))}
                        className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 border-2 ${selectedPart === partId
                                ? 'border-blue-600 bg-white shadow-md'
                                : 'border-transparent bg-slate-100/50 hover:bg-slate-200/50'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full transition-transform duration-300 ${selectedPart === partId ? 'bg-blue-600 scale-125' : 'bg-slate-300'
                                    }`}
                            />
                            <span className={`text-sm font-bold ${selectedPart === partId ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                {partLabels[partId] || partId}
                            </span>
                        </div>
                        <ChevronRight
                            size={16}
                            className={`transition-transform duration-300 ${selectedPart === partId ? 'translate-x-0 text-blue-600' : '-translate-x-2 opacity-0'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PartSelector;
