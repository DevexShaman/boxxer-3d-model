import Scene from './components/three/Scene';
import ColorPicker from './components/ui/ColorPicker';
import TexturePicker from './components/ui/TexturePicker';
import LogoUploader from './components/ui/LogoUploader';
import { Camera, ChevronRight, Share2, ShoppingCart, Box, Download } from 'lucide-react';
import { exportSceneToImage } from './services/imageExport';

function App() {
    const handleExport = async () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            try {
                await exportSceneToImage(canvas);
                console.log('Image exported successfully');
            } catch (err) {
                alert('Failed to export image. See console for details.');
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#f1f5f9] text-slate-900 overflow-hidden font-outfit">
            {/* 3D Viewer Area */}
            <div className="flex-1 relative group">
                <Scene />

                {/* Floating Branding */}
                <div className="absolute top-8 left-8 z-10 pointer-events-none animate-fade-in w-[calc(100%-4rem)]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/40">
                            <Box className="text-white w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Boxxerworld <span className="text-blue-600 italic">3D</span></h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 ml-0.5">Premium Customizer</p>
                        </div>
                    </div>
                </div>

                {/* Floating View Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 glass-panel p-2 rounded-2xl animate-fade-in">
                    {[
                        { icon: Camera, label: 'Default' },
                        { icon: Camera, label: 'Front' },
                        { icon: Camera, label: 'Side' },
                        { icon: Camera, label: 'Top' }
                    ].map((item, idx) => (
                        <button key={idx} className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all group">
                            <item.icon size={18} className="text-slate-400 group-hover:text-blue-600" />
                            <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Action Buttons Floating */}
                <div className="absolute bottom-8 right-8 z-10 animate-fade-in">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 p-4 bg-white rounded-2xl shadow-lg border border-white/50 hover:bg-slate-50 transition-all active:scale-95 group"
                        title="Download Preview"
                    >
                        <Download className="text-blue-600" size={20} />
                        <span className="text-sm font-bold text-slate-700">Capture Preview</span>
                    </button>
                </div>
            </div>

            {/* Control Panel Area */}
            <div className="w-full md:w-[450px] glass-panel border-l border-white/50 flex flex-col z-20 overflow-hidden m-4 rounded-3xl animate-fade-in">
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-2">Configure Design</h2>
                        <p className="text-slate-500 text-sm">Personalize every detail of your product.</p>
                    </div>

                    <div className="space-y-10">
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">01</span>
                                <h3 className="font-bold text-lg">Material Selection</h3>
                            </div>
                            <div className="grid gap-6">
                                {[
                                    { id: 'BX_8_BRIT_CURVED_1_1', label: 'Main Body' },
                                    { id: 'BX_8_BRIT_CURVED_1_2', label: 'Waistband' },
                                    { id: 'BX_8_BRIT_CURVED_1_3', label: 'Left Side Panel' },
                                    { id: 'BX_8_BRIT_CURVED_1_4', label: 'Right Side Panel' },
                                    { id: 'BX_8_BRIT_CURVED_1_5', label: 'Bottom Trim' },
                                    { id: 'BX_8_BRIT_CURVED_1_6', label: 'Waistband Logo Area' },
                                    { id: 'BX_8_BRIT_CURVED_1_7', label: 'Inner Lining' },
                                ].map((part, index) => (
                                    <div key={part.id} className={`space-y-4 ${index > 0 ? 'border-t border-slate-100 pt-6' : ''}`}>
                                        <ColorPicker partName={part.id} label={part.label} />
                                        <TexturePicker partName={part.id} label={part.label} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">02</span>
                                <h3 className="font-bold text-lg">Identity & Graphics</h3>
                            </div>
                            <LogoUploader />
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-4 bg-white/50 border-t border-white/50 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current total</p>
                            <p className="text-3xl font-bold text-slate-900">$189.00</p>
                        </div>
                        <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-slate-600">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <button className="w-full premium-button flex items-center justify-center gap-3">
                        <ShoppingCart size={20} />
                        <span>Add to Cart</span>
                        <ChevronRight size={18} className="opacity-50" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
