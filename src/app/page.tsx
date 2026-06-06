'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Palette, Disc3, Trash2, Star, ChevronDown,
  Swords, Shield, Zap, Weight, Anchor, RotateCw, Target,
  ArrowUpDown, Crosshair, Loader2, Download, Heart,
  BookOpen, X, Plus, Wand2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Types
interface TazoArt {
  id: string;
  name: string;
  collection: string;
  rarity: string;
  role: string;
  description: string;
  prompt: string;
  imageData: string;
  attack: number;
  defense: number;
  resistance: number;
  weight: number;
  stability: number;
  spin: number;
  control: number;
  bounce: number;
  precision: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Constants
const COLLECTIONS = [
  { id: 'minimon', name: 'Minimon', gradient: 'gradient-minimon', color: '#FFCB05', icon: '🟡', desc: 'Pokemon-inspired creatures' },
  { id: 'dracobell', name: 'Dracobell', gradient: 'gradient-dracobell', color: '#FF6B00', icon: '🟠', desc: 'Dragon Ball warriors' },
  { id: 'cybermon', name: 'Cybermon', gradient: 'gradient-cybermon', color: '#00A1E9', icon: '🔵', desc: 'Digital monsters' },
];

const RARITIES = [
  { id: 'common', name: 'Common', color: '#9CA3AF', bg: 'bg-zinc-200', border: 'border-zinc-400' },
  { id: 'uncommon', name: 'Uncommon', color: '#22C55E', bg: 'bg-green-100', border: 'border-green-400' },
  { id: 'rare', name: 'Rare', color: '#3B82F6', bg: 'bg-blue-100', border: 'border-blue-400' },
  { id: 'ultra-rare', name: 'Ultra-Rare', color: '#A855F7', bg: 'bg-purple-100', border: 'border-purple-400' },
  { id: 'legendary', name: 'Legendary', color: '#FFCC00', bg: 'bg-yellow-100', border: 'border-yellow-400' },
];

const ROLES = [
  { id: 'attacker', name: 'Attacker', icon: Swords, color: '#E3350D' },
  { id: 'tank', name: 'Tank', icon: Shield, color: '#3B4CCA' },
  { id: 'technical', name: 'Technical', icon: Target, color: '#00A1E9' },
  { id: 'bouncer', name: 'Bouncer', icon: ArrowUpDown, color: '#78C850' },
  { id: 'heavy', name: 'Heavy', icon: Weight, color: '#7C3AED' },
  { id: 'light', name: 'Light', icon: Zap, color: '#F59E0B' },
  { id: 'balanced', name: 'Balanced', icon: Anchor, color: '#6B7280' },
  { id: 'special', name: 'Special', icon: Sparkles, color: '#EC4899' },
];

const STATS = [
  { key: 'attack', name: 'ATK', icon: Swords, color: '#E3350D' },
  { key: 'defense', name: 'DEF', icon: Shield, color: '#3B4CCA' },
  { key: 'resistance', name: 'RES', icon: Shield, color: '#78C850' },
  { key: 'weight', name: 'WGT', icon: Weight, color: '#7C3AED' },
  { key: 'stability', name: 'STB', icon: Anchor, color: '#6B7280' },
  { key: 'spin', name: 'SPN', icon: RotateCw, color: '#F59E0B' },
  { key: 'control', name: 'CTR', icon: Crosshair, color: '#00A1E9' },
  { key: 'bounce', name: 'BNC', icon: ArrowUpDown, color: '#FF6B00' },
  { key: 'precision', name: 'PRC', icon: Target, color: '#EC4899' },
];

// Preset descriptions by collection
const PRESET_DESCRIPTIONS: Record<string, string[]> = {
  minimon: [
    'A small electric mouse creature with lightning bolt tail and red cheeks',
    'A flame lizard with a burning tail and orange scales',
    'A turtle with a water cannon shell and blue skin',
    'A green gecko with leaf blades on its arms',
    'A pink fairy creature with mystical moon power',
    'A ghostly purple blob surrounded by shadow mist',
  ],
  dracobell: [
    'A spiky-haired warrior in orange gi with golden aura',
    'A green-skinned martial artist in white cape',
    'A proud prince with flame-style hair and armor',
    'A massive muscular warrior with a tail and horns',
    'A young fighter with purple hair and sword',
    'A fused warrior with earrings and merged outfit',
  ],
  cybermon: [
    'A digital dinosaur with metallic armor and blue stripes',
    'A winged cyber-angel with holy ring and eight wings',
    'A robotic wolf with chrome body and laser fangs',
    'A plant-reptile hybrid with thorned vines',
    'A ghost clown with masked face and juggling balls',
    'A knight in digital armor with sacred shield',
  ],
};

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [tazoArts, setTazoArts] = useState<TazoArt[]>([]);
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('minimon');
  const [rarity, setRarity] = useState('common');
  const [role, setRole] = useState('balanced');
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  // Detail modal
  const [selectedTazo, setSelectedTazo] = useState<TazoArt | null>(null);

  // Gallery filter
  const [galleryFilter, setGalleryFilter] = useState<string>('all');

  // Fetch gallery
  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/tazo-art');
      const data = await res.json();
      if (data.success) {
        setTazoArts(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Generate tazo art
  const handleGenerate = async () => {
    if (!name.trim() || !description.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Name and description are required!',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tazo-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          collection,
          rarity,
          role,
          description: description.trim(),
          customPrompt: useCustomPrompt ? customPrompt.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Tazo created!',
          description: `${name} has been added to your collection!`,
        });
        setTazoArts(prev => [data.data, ...prev]);
        setActiveTab('gallery');
        // Reset form
        setName('');
        setDescription('');
        setCustomPrompt('');
      } else {
        toast({
          title: 'Generation failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (tazo: TazoArt) => {
    try {
      await fetch(`/api/tazo-art/${tazo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !tazo.isFavorite }),
      });
      setTazoArts(prev =>
        prev.map(t => (t.id === tazo.id ? { ...t, isFavorite: !t.isFavorite } : t))
      );
    } catch {
      // silently fail
    }
  };

  // Delete tazo
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tazo-art/${id}`, { method: 'DELETE' });
      setTazoArts(prev => prev.filter(t => t.id !== id));
      if (selectedTazo?.id === id) setSelectedTazo(null);
      toast({ title: 'Tazo deleted', description: 'Removed from collection' });
    } catch {
      // silently fail
    }
  };

  // Download tazo image
  const handleDownload = (tazo: TazoArt) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${tazo.imageData}`;
    link.download = `tazo-${tazo.collection}-${tazo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  // Get filtered gallery
  const filteredArts = galleryFilter === 'all'
    ? tazoArts
    : galleryFilter === 'favorites'
    ? tazoArts.filter(t => t.isFavorite)
    : tazoArts.filter(t => t.collection === galleryFilter);

  // Get collection info
  const getCollectionInfo = (id: string) => COLLECTIONS.find(c => c.id === id);
  const getRarityInfo = (id: string) => RARITIES.find(r => r.id === id);
  const getRoleInfo = (id: string) => ROLES.find(r => r.id === id);

  // Random preset
  const handleRandomPreset = () => {
    const presets = PRESET_DESCRIPTIONS[collection] || PRESET_DESCRIPTIONS.minimon;
    const preset = presets[Math.floor(Math.random() * presets.length)];
    setDescription(preset);
  };

  // Stat bar color based on value
  const getStatColor = (value: number) => {
    if (value >= 80) return '#22C55E';
    if (value >= 60) return '#FFCC00';
    if (value >= 40) return '#FF6B00';
    return '#E3350D';
  };

  return (
    <div className="min-h-screen flex flex-col mag-bg">
      {/* MASTHEAD */}
      <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a1a] relative overflow-hidden">
        <div className="mag-stripes absolute inset-0 opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-[#FFCC00] bg-[#FFCC00] flex items-center justify-center shadow-[3px_3px_0px_#FFCC00]">
                <Disc3 className="w-6 h-6 sm:w-7 sm:h-7 text-[#1a1a1a]" />
              </div>
              <div>
                <h1 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-[#FFCC00] mag-stroke-sm">
                  Tazo Art Studio
                </h1>
                <p className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-zinc-400">
                  Create. Collect. Battle.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="color-dots">
                <span style={{ backgroundColor: '#FFCC00' }} />
                <span style={{ backgroundColor: '#E3350D' }} />
                <span style={{ backgroundColor: '#3B4CCA' }} />
                <span style={{ backgroundColor: '#FF6B00' }} />
                <span style={{ backgroundColor: '#00A1E9' }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <TabsList className="bg-[#1a1a1a] border-3 border-[#1a1a1a] p-1 h-auto gap-1">
              <TabsTrigger
                value="create"
                className="font-black uppercase tracking-wider text-xs sm:text-sm px-4 sm:px-6 py-2 data-[state=active]:bg-[#FFCC00] data-[state=active]:text-[#1a1a1a]"
              >
                <Wand2 className="w-4 h-4 mr-1.5" />
                Create
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="font-black uppercase tracking-wider text-xs sm:text-sm px-4 sm:px-6 py-2 data-[state=active]:bg-[#FFCC00] data-[state=active]:text-[#1a1a1a] relative"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                Gallery
                {tazoArts.length > 0 && (
                  <span className="ml-1.5 bg-[#E3350D] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                    {tazoArts.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* CREATE TAB */}
          <TabsContent value="create" className="page-enter">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-5">
                {/* Collection Selection */}
                <div className="mag-card p-5 sm:p-6">
                  <h3 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Choose Collection
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COLLECTIONS.map(col => (
                      <button
                        key={col.id}
                        onClick={() => { setCollection(col.id); setDescription(''); }}
                        className={`p-4 border-3 border-[#1a1a1a] transition-all text-left ${
                          collection === col.id
                            ? `${col.gradient} shadow-[4px_4px_0px_#1a1a1a] scale-[1.02]`
                            : 'bg-[#fffef0] shadow-[2px_2px_0px_#1a1a1a] hover:shadow-[3px_3px_0px_#1a1a1a]'
                        }`}
                      >
                        <div className="font-black text-sm uppercase tracking-wider mb-1">
                          {col.name}
                        </div>
                        <div className="font-bold text-[10px] uppercase tracking-wider text-zinc-600">
                          {col.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Description */}
                <div className="mag-card p-5 sm:p-6">
                  <h3 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Design Your Tazo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-black text-xs uppercase tracking-wider mb-1.5 block">
                        Tazo Name
                      </Label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter a name for your tazo..."
                        className="border-2 border-[#1a1a1a] bg-[#fffef0] font-bold placeholder:font-normal focus:ring-[#FFCC00] focus:border-[#FFCC00]"
                        maxLength={30}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="font-black text-xs uppercase tracking-wider">
                          Visual Description
                        </Label>
                        <button
                          onClick={handleRandomPreset}
                          className="font-black text-[10px] uppercase tracking-wider text-[#3B4CCA] hover:text-[#FF6B00] transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Random
                        </button>
                      </div>
                      <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder={`Describe what your ${getCollectionInfo(collection)?.name || ''} tazo should look like...`}
                        className="border-2 border-[#1a1a1a] bg-[#fffef0] font-bold min-h-[80px] placeholder:font-normal focus:ring-[#FFCC00] focus:border-[#FFCC00]"
                        maxLength={300}
                      />
                    </div>

                    {/* Custom Prompt Toggle */}
                    <div>
                      <button
                        onClick={() => setUseCustomPrompt(!useCustomPrompt)}
                        className="font-black text-[10px] uppercase tracking-wider text-[#1a1a1a] hover:text-[#E3350D] transition-colors flex items-center gap-1"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${useCustomPrompt ? 'rotate-180' : ''}`} />
                        Advanced: Custom AI Prompt
                      </button>
                      {useCustomPrompt && (
                        <Textarea
                          value={customPrompt}
                          onChange={e => setCustomPrompt(e.target.value)}
                          placeholder="Write your own complete AI image generation prompt..."
                          className="mt-2 border-2 border-[#1a1a1a] bg-[#fffef0] font-bold min-h-[80px] placeholder:font-normal focus:ring-[#FFCC00] focus:border-[#FFCC00] text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Rarity & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Rarity */}
                  <div className="mag-card p-5">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Rarity
                    </h3>
                    <div className="space-y-2">
                      {RARITIES.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRarity(r.id)}
                          className={`w-full flex items-center gap-3 p-2.5 border-2 transition-all text-left ${
                            rarity === r.id
                              ? `border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] ${r.bg}`
                              : 'border-transparent hover:bg-zinc-50'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full border-2 border-[#1a1a1a] flex-shrink-0"
                            style={{ backgroundColor: r.color }}
                          />
                          <span className="font-black text-xs uppercase tracking-wider">
                            {r.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mag-card p-5">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Swords className="w-4 h-4" />
                      Role
                    </h3>
                    <div className="space-y-2">
                      {ROLES.map(r => {
                        const Icon = r.icon;
                        return (
                          <button
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={`w-full flex items-center gap-3 p-2.5 border-2 transition-all text-left ${
                              role === r.id
                                ? 'border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] bg-[#fffef0]'
                                : 'border-transparent hover:bg-zinc-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: r.color }} />
                            <span className="font-black text-xs uppercase tracking-wider">
                              {r.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Preview Panel */}
              <div className="space-y-5">
                {/* Live Preview */}
                <div className="mag-card p-5 sm:p-6">
                  <h3 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Disc3 className="w-4 h-4" />
                    Preview
                  </h3>

                  {/* Tazo Disc Preview */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_#1a1a1a] ${
                        collection === 'minimon' ? 'gradient-minimon' :
                        collection === 'dracobell' ? 'gradient-dracobell' : 'gradient-cybermon'
                      }`}
                    >
                      {rarity === 'legendary' && <div className="legendary-glow absolute inset-0" />}
                      {rarity === 'ultra-rare' && <div className="holo-border absolute inset-0" />}
                      <div className="text-center z-10">
                        {name ? (
                          <span className="font-black text-lg uppercase tracking-wider text-white mag-stroke-sm">
                            {name}
                          </span>
                        ) : (
                          <Plus className="w-8 h-8 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-black text-sm uppercase tracking-wider">
                        {name || 'Unnamed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <Badge
                        className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a]"
                        style={{
                          backgroundColor: getCollectionInfo(collection)?.color,
                          color: collection === 'minimon' ? '#1a1a1a' : '#fff'
                        }}
                      >
                        {getCollectionInfo(collection)?.name}
                      </Badge>
                      <Badge
                        className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a]"
                        style={{ backgroundColor: getRarityInfo(rarity)?.color, color: rarity === 'common' ? '#1a1a1a' : '#fff' }}
                      >
                        {getRarityInfo(rarity)?.name}
                      </Badge>
                      <Badge
                        className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a] bg-[#fffef0] text-[#1a1a1a]"
                      >
                        {getRoleInfo(role)?.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !name.trim() || !description.trim()}
                  className="mag-btn w-full py-4 bg-[#FFCC00] text-[#1a1a1a] text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mag-spinner" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Tazo Art
                    </>
                  )}
                </button>

                {/* Quick Tips */}
                <div className="mag-card p-4 bg-[#1a1a1a] text-white">
                  <h4 className="font-black text-xs uppercase tracking-wider mb-2 text-[#FFCC00]">
                    Tips
                  </h4>
                  <ul className="space-y-1.5 text-[10px] font-bold">
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 mt-0.5 text-[#FFCC00] flex-shrink-0" />
                      Higher rarity = stronger base stats
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 mt-0.5 text-[#FFCC00] flex-shrink-0" />
                      Role determines stat distribution
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 mt-0.5 text-[#FFCC00] flex-shrink-0" />
                      Use Random for inspiration
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 mt-0.5 text-[#FFCC00] flex-shrink-0" />
                      Custom prompts give full control
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* GALLERY TAB */}
          <TabsContent value="gallery" className="page-enter">
            {/* Gallery Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-black text-lg uppercase tracking-wider">
                  Your Collection
                </h2>
                <p className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                  {tazoArts.length} tazo{tazoArts.length !== 1 ? 's' : ''} created
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'favorites', label: 'Favorites' },
                  ...COLLECTIONS.map(c => ({ id: c.id, label: c.name })),
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setGalleryFilter(f.id)}
                    className={`font-black text-[10px] uppercase tracking-wider px-3 py-1.5 border-2 border-[#1a1a1a] transition-all ${
                      galleryFilter === f.id
                        ? 'bg-[#FFCC00] text-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]'
                        : 'bg-[#fffef0] hover:bg-zinc-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            {galleryLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 mag-spinner text-[#1a1a1a]" />
              </div>
            ) : filteredArts.length === 0 ? (
              <div className="mag-card p-10 text-center">
                <Disc3 className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                <h3 className="font-black text-sm uppercase tracking-wider mb-2">
                  No tazos yet
                </h3>
                <p className="font-bold text-xs text-zinc-500 uppercase tracking-wider mb-4">
                  Create your first tazo to start your collection
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mag-btn bg-[#FFCC00] text-[#1a1a1a] px-6 py-2 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Tazo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredArts.map(tazo => {
                  const colInfo = getCollectionInfo(tazo.collection);
                  const rarInfo = getRarityInfo(tazo.rarity);
                  return (
                    <div
                      key={tazo.id}
                      className={`mag-card tazo-card-hover cursor-pointer overflow-hidden relative ${
                        tazo.rarity === 'legendary' ? 'legendary-glow' : ''
                      }`}
                      onClick={() => setSelectedTazo(tazo)}
                    >
                      {tazo.isFavorite && (
                        <div className="exclusive-badge">
                          <Heart className="w-3 h-3 fill-white" />
                        </div>
                      )}
                      {/* Image */}
                      <div
                        className={`aspect-square relative ${
                          tazo.rarity === 'ultra-rare' ? 'holo-border' : ''
                        }`}
                      >
                        <img
                          src={`data:image/png;base64,${tazo.imageData}`}
                          alt={tazo.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Collection Gradient Overlay at bottom */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-10 opacity-90"
                          style={{
                            background: `linear-gradient(to top, ${colInfo?.color || '#1a1a1a'}, transparent)`
                          }}
                        />
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h4 className="font-black text-xs uppercase tracking-wider truncate">
                          {tazo.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            className="font-black text-[8px] uppercase tracking-wider px-1 py-0 h-4 border border-[#1a1a1a]"
                            style={{ backgroundColor: rarInfo?.color, color: ['common'].includes(tazo.rarity) ? '#1a1a1a' : '#fff' }}
                          >
                            {rarInfo?.name}
                          </Badge>
                          <Badge className="font-black text-[8px] uppercase tracking-wider px-1 py-0 h-4 border border-[#1a1a1a] bg-[#fffef0]">
                            {colInfo?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#1a1a1a] bg-[#1a1a1a] mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#FFCC00]" />
              <span className="font-black text-xs uppercase tracking-wider text-[#FFCC00]">
                Tazo Art Studio
              </span>
            </div>
            <p className="font-bold text-[9px] uppercase tracking-wider text-zinc-500">
              Powered by AI Image Generation — 90s Magazine Aesthetic
            </p>
            <div className="color-dots">
              <span style={{ backgroundColor: '#FFCC00' }} />
              <span style={{ backgroundColor: '#E3350D' }} />
              <span style={{ backgroundColor: '#3B4CCA' }} />
              <span style={{ backgroundColor: '#FF6B00' }} />
              <span style={{ backgroundColor: '#00A1E9' }} />
            </div>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedTazo} onOpenChange={() => setSelectedTazo(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-[#fffbe6] border-3 border-[#1a1a1a] p-0">
          {selectedTazo && (
            <div className="relative">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedTazo.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative bg-[#1a1a1a] p-6 flex items-center justify-center min-h-[300px]">
                  <div
                    className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 shadow-[6px_6px_0px_rgba(255,204,0,0.5)] ${
                      selectedTazo.rarity === 'legendary' ? 'border-[#FFCC00]' :
                      selectedTazo.rarity === 'ultra-rare' ? 'border-[#A855F7]' :
                      'border-white'
                    } ${selectedTazo.rarity === 'ultra-rare' ? 'holo-border' : ''}`}
                  >
                    <img
                      src={`data:image/png;base64,${selectedTazo.imageData}`}
                      alt={selectedTazo.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedTazo.rarity === 'legendary' && (
                      <div className="metallic-effect absolute inset-0" />
                    )}
                  </div>
                </div>

                {/* Right: Info */}
                <div className="p-5 sm:p-6 space-y-4 custom-scrollbar overflow-y-auto max-h-[70vh]">
                  {/* Name & Badges */}
                  <div>
                    <h2 className="font-black text-xl uppercase tracking-tight">
                      {selectedTazo.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge
                        className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a]"
                        style={{
                          backgroundColor: getCollectionInfo(selectedTazo.collection)?.color,
                          color: selectedTazo.collection === 'minimon' ? '#1a1a1a' : '#fff'
                        }}
                      >
                        {getCollectionInfo(selectedTazo.collection)?.name}
                      </Badge>
                      <Badge
                        className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a]"
                        style={{
                          backgroundColor: getRarityInfo(selectedTazo.rarity)?.color,
                          color: selectedTazo.rarity === 'common' ? '#1a1a1a' : '#fff'
                        }}
                      >
                        {getRarityInfo(selectedTazo.rarity)?.name}
                      </Badge>
                      <Badge className="font-black text-[9px] uppercase tracking-wider border-2 border-[#1a1a1a] bg-[#fffef0] text-[#1a1a1a]">
                        {getRoleInfo(selectedTazo.role)?.name}
                      </Badge>
                    </div>
                  </div>

                  <p className="font-bold text-xs text-zinc-600 leading-relaxed">
                    {selectedTazo.description}
                  </p>

                  <Separator className="bg-[#1a1a1a]" />

                  {/* Combat Stats */}
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" />
                      Combat Stats
                    </h3>
                    <div className="space-y-2">
                      {STATS.map(stat => {
                        const value = selectedTazo[stat.key as keyof TazoArt] as number;
                        return (
                          <div key={stat.key} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 w-14 flex-shrink-0">
                              <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                              <span className="font-black text-[10px] uppercase tracking-wider">
                                {stat.name}
                              </span>
                            </div>
                            <div className="flex-1 stat-bar">
                              <div
                                className="stat-bar-fill"
                                style={{
                                  width: `${value}%`,
                                  backgroundColor: getStatColor(value),
                                }}
                              />
                            </div>
                            <span className="font-black text-[10px] w-6 text-right" style={{ color: getStatColor(value) }}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-[#1a1a1a]" />

                  {/* Power Score */}
                  <div className="mag-card-yellow p-3 text-center">
                    <div className="font-black text-[10px] uppercase tracking-wider text-[#1a1a1a]">
                      Power Score
                    </div>
                    <div className="font-black text-2xl text-[#1a1a1a]">
                      {Math.round(
                        (selectedTazo.attack + selectedTazo.defense + selectedTazo.resistance +
                         selectedTazo.weight + selectedTazo.stability + selectedTazo.spin +
                         selectedTazo.control + selectedTazo.bounce + selectedTazo.precision) / 9
                      )}
                    </div>
                  </div>

                  <Separator className="bg-[#1a1a1a]" />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedTazo)}
                      className={`mag-btn flex-1 py-2 text-xs flex items-center justify-center gap-1.5 ${
                        selectedTazo.isFavorite ? 'bg-[#E3350D] text-white' : 'bg-[#fffef0] text-[#1a1a1a]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${selectedTazo.isFavorite ? 'fill-white' : ''}`} />
                      {selectedTazo.isFavorite ? 'Favorited' : 'Favorite'}
                    </button>
                    <button
                      onClick={() => handleDownload(selectedTazo)}
                      className="mag-btn flex-1 py-2 text-xs bg-[#3B4CCA] text-white flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(selectedTazo.id)}
                      className="mag-btn py-2 px-3 text-xs bg-[#fffef0] text-[#E3350D] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Prompt Used */}
                  <details className="text-[10px]">
                    <summary className="font-black uppercase tracking-wider text-zinc-500 cursor-pointer">
                      AI Prompt Used
                    </summary>
                    <p className="mt-1 font-medium text-zinc-400 leading-relaxed">
                      {selectedTazo.prompt}
                    </p>
                  </details>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
