import React from 'react';
import { Fabric } from '../../utils/parseFabrics';
import FabricCard from './FabricCard';

interface FabricGridProps {
    fabrics: Fabric[];
    selectedFabricId: string | null;
    onSelect: (fabric: Fabric) => void;
    isLoading?: boolean;
}

const FabricGrid = ({ fabrics, selectedFabricId, onSelect, isLoading }: FabricGridProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-4 gap-2 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-xl" />
                ))}
            </div>
        );
    }

    if (fabrics.length === 0) {
        return (
            <div className="p-8 text-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">No fabrics found for this color.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {fabrics.map((fabric) => (
                <FabricCard
                    key={fabric.id}
                    fabric={fabric}
                    isSelected={selectedFabricId === fabric.id}
                    onClick={() => onSelect(fabric)}
                />
            ))}
        </div>
    );
};

export default FabricGrid;
