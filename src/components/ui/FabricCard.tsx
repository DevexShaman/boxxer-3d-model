import React from 'react';
import { Fabric } from '../../utils/parseFabrics';
import { Layers, Database, Droplets } from 'lucide-react';

interface FabricCardProps {
    fabric: Fabric;
    isSelected: boolean;
    onClick: () => void;
}

const FabricCard = ({ fabric, isSelected, onClick }: FabricCardProps) => {
    const hasNormal = !!fabric.maps.normalMap;
    const hasRoughness = !!fabric.maps.roughnessMap;
    const hasMetalness = !!fabric.maps.metalnessMap;

    const thumbnailUrl = fabric.thumbnails.medium || fabric.thumbnails.small || fabric.thumbnails.large;

    if (!thumbnailUrl) {
        console.warn(`[FabricCard] No thumbnail found for fabric ID: ${fabric.id} (${fabric.name})`);
    }

    return (
        <button
            onClick={onClick}
            className={`group flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 border-2 ${isSelected
                ? 'border-blue-600 bg-white ring-2 ring-blue-500/10 scale-[1.01] shadow-lg'
                : 'border-transparent bg-white/50 hover:bg-white hover:border-slate-200 hover:shadow-md'
                }`}
        >
            {/* Thumbnail */}
            <div className="aspect-square relative overflow-hidden bg-slate-200">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={fabric.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase p-4 text-center">
                        No Image
                    </div>
                )}

                {/* PBR Badges - Miniaturized */}
                <div className="absolute top-1.5 left-1.5 flex gap-0.5">
                    {hasNormal && (
                        <div className="bg-blue-600/70 backdrop-blur-sm p-0.5 rounded text-white" title="Normal Map">
                            <Layers size={8} />
                        </div>
                    )}
                    {hasRoughness && (
                        <div className="bg-purple-600/70 backdrop-blur-sm p-0.5 rounded text-white" title="Roughness Map">
                            <Droplets size={8} />
                        </div>
                    )}
                </div>

                {/* Price Badge - Compact */}
                {fabric.price.price > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 bg-slate-900/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                        +${fabric.price.price}
                    </div>
                )}
            </div>

            {/* Info - Ultra Compact */}
            <div className="p-2 space-y-0.5">
                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter truncate">{fabric.type}</p>
                <h4 className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight">{fabric.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                    <div
                        className="w-2 h-2 rounded-full border border-slate-200"
                        style={{ backgroundColor: fabric.hex }}
                    />
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{fabric.hex}</span>
                </div>
            </div>
        </button>
    );
};

export default FabricCard;
