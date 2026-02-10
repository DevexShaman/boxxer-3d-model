import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setPartFabric, selectPart } from './store/productSlice';
import { parseFabrics, filterFabricsByColor, Fabric } from './utils/parseFabrics';
import Scene from './components/three/Scene';
import PartSelector from './components/ui/PartSelector';
import FabricGrid from './components/ui/FabricGrid';
import LogoUploader from './components/ui/LogoUploader';
import { Camera, ChevronRight, Share2, ShoppingCart, Box, Download, Palette, Search } from 'lucide-react';
import { exportSceneToImage } from './services/imageExport';

function App() {
    const dispatch = useDispatch();
    const { selectedPart, parts } = useSelector((state: RootState) => state.product);

    // Data states
    const [allFabrics, setAllFabrics] = useState<Fabric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterColor, setFilterColor] = useState('#ffffff');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch fabric data
    useEffect(() => {
        fetch('/hdrs/materials-data.txt')
            .then(res => res.json())
            .then(data => {
                const parsed = parseFabrics(data);
                setAllFabrics(parsed);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load fabric data:', err);
                setIsLoading(false);
            });
    }, []);

    // Filtered fabrics based on color and search
    const filteredFabrics = useMemo(() => {
        let filtered = filterFabricsByColor(allFabrics, filterColor);
        if (searchQuery) {
            filtered = filtered.filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    }, [allFabrics, filterColor, searchQuery]);

    const handleFabricSelect = (fabric: Fabric) => {
        dispatch(setPartFabric({
            partName: selectedPart,
            fabricId: fabric.id,
            maps: fabric.maps
        }));
    };

    const handleExport = async () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            try {
                await exportSceneToImage(canvas);
            } catch (err) {
                alert('Failed to export preview.');
            }
        }
    };

    const currentPartConfig = parts[selectedPart];

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#f1f5f9] text-slate-900 overflow-hidden font-outfit">
            {/* 3D Viewer Area */}
            <div className="flex-1 relative group bg-gradient-to-br from-slate-200 to-slate-300">
                <Scene allFabrics={allFabrics} />

                {/* Floating Branding */}
                <div className="absolute top-8 left-8 z-10 pointer-events-none animate-fade-in">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/40">
                            <Box className="text-white w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Boxxerworld <span className="text-blue-600 italic">3D</span></h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 ml-0.5">Enterprise Customizer</p>
                        </div>
                    </div>
                </div>

                {/* Floating View Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 glass-panel p-2 rounded-2xl animate-fade-in">
                    {['Default', 'Front', 'Side', 'Top'].map((label) => (
                        <button key={label} className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all group">
                            <Camera size={18} className="text-slate-400 group-hover:text-blue-600" />
                            <span className="text-sm font-semibold text-slate-600">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Action Buttons Floating */}
                <div className="absolute bottom-8 right-8 z-10 animate-fade-in">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 p-4 bg-white rounded-2xl shadow-lg border border-white/50 hover:bg-slate-50 transition-all active:scale-95 group"
                    >
                        <Download className="text-blue-600" size={20} />
                        <span className="text-sm font-bold text-slate-700">Capture 4K</span>
                    </button>
                </div>
            </div>

            {/* Control Panel Area */}
            <div className="w-full md:w-[450px] glass-panel border-l border-white/50 flex flex-col z-20 overflow-hidden m-4 rounded-3xl animate-fade-in shadow-2xl">
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-2">Design Lab</h2>
                        <p className="text-slate-500 text-sm">Professional Grade Product Customization</p>
                    </div>

                    <div className="space-y-10">
                        {/* Step 1: Part Selection */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">01</span>
                                <h3 className="font-bold text-lg">Target Part</h3>
                            </div>
                            <PartSelector />
                        </section>

                        {/* Step 2: Fabric Library */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">02</span>
                                <h3 className="font-bold text-lg">Fabric Library</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Color Filter Palette */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Palette size={12} />
                                        <span>Filter by Color</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFilterColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${filterColor === color ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent'}`}
                                            >
                                                <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                                            </button>
                                        ))}
                                        <div className="relative group w-8 h-8">
                                            <input
                                                type="color"
                                                value={filterColor}
                                                onChange={(e) => setFilterColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600 transition-colors">
                                                <span className="text-lg">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search materials (e.g. Leather, Satin)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Results Grid */}
                                <FabricGrid
                                    fabrics={filteredFabrics}
                                    selectedFabricId={currentPartConfig?.fabricId}
                                    onSelect={handleFabricSelect}
                                    isLoading={isLoading}
                                />
                            </div>
                        </section>

                        {/* Step 3: Identity & Graphics */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">03</span>
                                <h3 className="font-bold text-lg">Identity & Graphics</h3>
                            </div>
                            <LogoUploader />
                        </section>
                    </div>
                </div>

                {/* Footer Component */}
                <div className="p-8 pt-4 bg-white/80 border-t border-slate-100 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimated</p>
                            <p className="text-3xl font-bold text-slate-900">$249.00</p>
                        </div>
                        <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <button className="w-full premium-button flex items-center justify-center gap-3 py-4 shadow-xl shadow-blue-500/20">
                        <ShoppingCart size={20} />
                        <span className="text-lg font-bold">Checkout Design</span>
                        <ChevronRight size={18} className="opacity-50" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
