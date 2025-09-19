import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, TreePine, Leaf, Zap, X, RotateCcw } from 'lucide-react';
import { detectTree, TreeDetectionResponse } from '@/lib/aiService';
import { useToast } from '@/hooks/use-toast';

interface TreeFact {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  funFacts: string[];
  environmentalBenefits: string[];
  imageUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}

interface ARTreeScannerProps {
  onClose?: () => void;
}

// Enhanced tree database with more variety including Neem tree
const TREE_DATABASE: TreeFact[] = [
  {
    id: 'neem-1',
    name: 'Neem Tree',
    scientificName: 'Azadirachta indica',
    description: 'A versatile medicinal tree native to India, known as the "village pharmacy".',
    funFacts: [
      'Neem is called "Nature\'s Drugstore" - every part is medicinal!',
      'Neem leaves can purify air and repel insects naturally.',
      'The tree can survive in very dry conditions and poor soil.',
      'Neem oil has been used for over 4000 years in Ayurveda!'
    ],
    environmentalBenefits: [
      'Natural air purifier - removes 70% of pollutants',
      'Absorbs 35 pounds of CO2 per year',
      'Repels mosquitoes and harmful insects',
      'Improves soil fertility naturally'
    ],
    rarity: 'uncommon'
  },
  {
    id: 'mango-1',
    name: 'Mango Tree',
    scientificName: 'Mangifera indica',
    description: 'The king of fruits! A tropical tree that provides delicious mangoes.',
    funFacts: [
      'Mango trees can live for over 300 years!',
      'There are over 1000 varieties of mangoes worldwide.',
      'Mango leaves are considered sacred in Hindu culture.',
      'A single mango tree can produce 200-300 fruits per year!'
    ],
    environmentalBenefits: [
      'Produces oxygen for 6 people daily',
      'Absorbs 40 pounds of CO2 per year',
      'Provides food for birds and animals',
      'Shade tree that cools the environment'
    ],
    rarity: 'common'
  },
  {
    id: 'banyan-1',
    name: 'Banyan Tree',
    scientificName: 'Ficus benghalensis',
    description: 'A massive tree with aerial roots that can cover acres of land.',
    funFacts: [
      'Banyan trees can live for over 2000 years!',
      'They can grow to cover several acres with their canopy.',
      'The largest banyan tree has 3000+ aerial roots!',
      'Banyan is considered sacred in many cultures.'
    ],
    environmentalBenefits: [
      'Creates micro-ecosystems supporting 100+ species',
      'Absorbs 60 pounds of CO2 per year',
      'Natural air conditioning - cools area by 5-10°C',
      'Prevents soil erosion with extensive root system'
    ],
    rarity: 'rare'
  },
  {
    id: 'oak-1',
    name: 'Oak Tree',
    scientificName: 'Quercus robur',
    description: 'A majestic deciduous tree known for its strength and longevity.',
    funFacts: [
      'Oak trees can live for over 1000 years!',
      'A single oak tree can produce 10,000 acorns in a good year.',
      'Oak wood is so strong it was used to build ships in the past.',
      'The largest oak tree ever recorded was over 100 feet tall!'
    ],
    environmentalBenefits: [
      'Produces oxygen for 4 people daily',
      'Absorbs 48 pounds of CO2 per year',
      'Provides habitat for 500+ species',
      'Prevents soil erosion with deep roots'
    ],
    rarity: 'common'
  },
  {
    id: 'pine-1',
    name: 'Pine Tree',
    scientificName: 'Pinus sylvestris',
    description: 'An evergreen conifer that stays green all year round.',
    funFacts: [
      'Pine trees can survive temperatures as low as -40°C!',
      'Some pine cones only open when exposed to fire.',
      'Pine trees produce resin that has natural antibacterial properties.',
      'The oldest pine tree is over 4,800 years old!'
    ],
    environmentalBenefits: [
      'Produces oxygen year-round',
      'Absorbs 22 pounds of CO2 per year',
      'Provides winter shelter for wildlife',
      'Helps reduce noise pollution'
    ],
    rarity: 'common'
  },
  {
    id: 'eucalyptus-1',
    name: 'Eucalyptus Tree',
    scientificName: 'Eucalyptus globulus',
    description: 'A fast-growing tree known for its aromatic leaves and tall stature.',
    funFacts: [
      'Eucalyptus trees can grow 6 feet per year!',
      'They are the tallest flowering plants on Earth.',
      'Eucalyptus oil has natural antiseptic properties.',
      'Koalas eat only eucalyptus leaves - nothing else!'
    ],
    environmentalBenefits: [
      'Fast carbon sequestration - absorbs 50+ pounds CO2/year',
      'Natural mosquito repellent properties',
      'Drought resistant and soil stabilizing',
      'Produces oxygen for 8 people daily'
    ],
    rarity: 'uncommon'
  },
  {
    id: 'redwood-1',
    name: 'Redwood Tree',
    scientificName: 'Sequoia sempervirens',
    description: 'One of the tallest tree species on Earth, reaching incredible heights.',
    funFacts: [
      'Redwoods can grow over 350 feet tall!',
      'They can live for more than 2000 years.',
      'Redwood bark is fire-resistant and can be 12 inches thick.',
      'A single redwood can hold 34,000 pounds of water!'
    ],
    environmentalBenefits: [
      'Produces oxygen for 20+ people daily',
      'Absorbs 250+ pounds of CO2 per year',
      'Creates its own microclimate',
      'Supports entire forest ecosystems'
    ],
    rarity: 'rare'
  },
  {
    id: 'peepal-1',
    name: 'Peepal Tree',
    scientificName: 'Ficus religiosa',
    description: 'A sacred tree in Indian culture, also known as the Bodhi tree.',
    funFacts: [
      'Buddha attained enlightenment under a Peepal tree!',
      'It\'s considered the most sacred tree in Hinduism.',
      'Peepal trees release oxygen even at night.',
      'The tree can live for over 2000 years!'
    ],
    environmentalBenefits: [
      '24/7 oxygen production - unique among trees',
      'Absorbs 45 pounds of CO2 per year',
      'Natural air purifier and dust filter',
      'Provides shade and cooling effect'
    ],
    rarity: 'uncommon'
  }
];

export const ARTreeScanner: React.FC<ARTreeScannerProps> = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedTree, setDetectedTree] = useState<TreeFact | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showTreeSelector, setShowTreeSelector] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);
      setScanningProgress(0);
      setDetectedTree(null); // Clear any previous detection

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure metadata is loaded before playing and scanning
        if (videoRef.current.readyState < 2) {
          await new Promise<void>((resolve) => {
            const onLoaded = () => {
              videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            };
            videoRef.current?.addEventListener('loadedmetadata', onLoaded, { once: true });
          });
        }
        await videoRef.current.play();
      }

      // Clear any existing intervals and timeouts
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }

      // Simulate scanning progress - slower and more realistic
      progressIntervalRef.current = setInterval(() => {
        setScanningProgress(prev => {
          const next = Math.min(100, prev + 5);
          if (next === 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            // Defer to next tick to ensure state is updated before detection
            setTimeout(() => {
              console.debug('Triggering detection at 100%');
              captureAndDetect();
            }, 0);

            // Add a fallback timeout in case detection fails
            if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
            detectionTimeoutRef.current = setTimeout(() => {
              if (isScanning && !detectedTree) {
                console.log('Fallback detection triggered');
                captureAndDetect();
              }
            }, 2000);
          }
          return next;
        });
      }, 300);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied. Please allow camera permissions.');
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    // Clear the progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Clear any pending detection timeout
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // If scanning was stopped early (less than 30% progress), show no detection message
    if (scanningProgress > 0 && scanningProgress < 30) {
      toast({
        title: "Scanning Stopped Too Early",
        description: "Hold the camera steady on a tree for better detection.",
        variant: "destructive"
      });
    }
    
    setIsScanning(false);
    setScanningProgress(0);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;
    // Ensure the video has frames ready
    if (videoRef.current.readyState < 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!canvasRef.current) {
      // Create an offscreen canvas lazily
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas as HTMLCanvasElement;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.8));
    if (!blob) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const result: TreeDetectionResponse | null = await detectTree(blob, abortRef.current.signal);
    if (!result) {
      setIsScanning(false);
      toast({
        title: 'No Tree Detected',
        description: 'Try better lighting and hold steady on a tree.',
        variant: 'destructive'
      });
      return;
    }

    // Prefer backend-provided tree details if available
    let matched = result.tree ? TREE_DATABASE.find(t => t.id === result.tree!.id || t.name === result.tree!.name) : undefined;
    if (!matched) {
      matched = TREE_DATABASE.find(t => t.name.toLowerCase().includes(result.label.toLowerCase()));
    }
    const looksLikeTree = /\b(tree|plant|leaf|bark|branch|foliage)\b/i.test(result.label);
    const isHighConfidence = (typeof result.confidence === 'number') ? result.confidence >= 0.6 : false;

    if (!matched && (!looksLikeTree || !isHighConfidence)) {
      setIsScanning(false);
      toast({
        title: 'No Tree Detected',
        description: 'Please point the camera at a tree or plant and try again.',
        variant: 'destructive'
      });
      return;
    }

    const picked = matched || TREE_DATABASE[0];
    setDetectedTree(picked);
    setIsScanning(false);
    
    toast({
      title: 'Tree Detected!',
      description: `Found a ${picked.name}!`,
    });

    // Fire-and-forget: send a lightweight AR tree session to backend
    (async () => {
      try {
        const duration = Math.max(1, Math.round(scanningProgress * 0.2));
        const body = {
          gameType: 'ar-tree',
          score: 10 + (matched.rarity === 'rare' ? 40 : matched.rarity === 'uncommon' ? 20 : 10),
          duration,
          level: 1,
          achievements: [],
          gameData: { treeId: picked.id, treeName: picked.name }
        } as any;

        // Use backend session endpoint if user is authenticated; fallback silently
        const { auth } = await import('@/lib/firebase');
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        await fetch('/api/games/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      } catch (e) {
        // Non-blocking
        console.warn('Failed to record AR tree scan', e);
      }
    })();
  };

  const resetScanner = () => {
    // Clear any running interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Clear any pending detection timeout
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    
    if (abortRef.current) abortRef.current.abort();
    setDetectedTree(null);
    setScanningProgress(0);
    setCameraError(null);
    setShowTreeSelector(false);
    setIsScanning(false);
  };

  const handleManualTreeSelection = (tree: TreeFact) => {
    setDetectedTree(tree);
    setShowTreeSelector(false);
    toast({
      title: "Tree Selected!",
      description: `You chose a ${tree.name}!`,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Leaf className="w-4 h-4" />;
      case 'uncommon': return <TreePine className="w-4 h-4" />;
      case 'rare': return <Zap className="w-4 h-4" />;
      case 'epic': return <Zap className="w-4 h-4" />;
      default: return <Leaf className="w-4 h-4" />;
    }
  };

  if (detectedTree) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TreePine className="w-6 h-6 text-green-600" />
              <CardTitle className="text-2xl text-green-800">
                Tree Discovered!
              </CardTitle>
            </div>
            <Badge className={getRarityColor(detectedTree.rarity)}>
              {getRarityIcon(detectedTree.rarity)}
              <span className="ml-1 capitalize">{detectedTree.rarity}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tree Info */}
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {detectedTree.name}
            </h3>
            <p className="text-lg text-gray-600 italic mb-4">
              {detectedTree.scientificName}
            </p>
            <p className="text-gray-700 mb-6">
              {detectedTree.description}
            </p>

            {/* Fun Facts */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Fun Facts
              </h4>
              <ul className="space-y-2">
                {detectedTree.funFacts.map((fact, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">🌿</span>
                    <span className="text-gray-700">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Environmental Benefits */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TreePine className="w-5 h-5 mr-2 text-green-500" />
                Environmental Benefits
              </h4>
              <ul className="space-y-2">
                {detectedTree.environmentalBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">🌱</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={resetScanner}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Another Tree
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-green-800">
          AR Tree Scanner
        </CardTitle>
        <CardDescription className="text-green-600">
          Point your camera at a tree to discover fun facts and environmental benefits!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold mb-2">Scanning for trees...</p>
                <div className="w-64 bg-gray-300 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      scanningProgress < 30 ? 'bg-red-500' : 
                      scanningProgress < 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${scanningProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2">
                  {scanningProgress}% - {
                    scanningProgress < 30 ? 'Point at a tree!' :
                    scanningProgress < 50 ? 'Keep scanning...' :
                    scanningProgress < 80 ? 'Good progress!' : 'Almost there!'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <div className="text-center text-red-800 p-4">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Camera Error</p>
                <p className="text-sm">{cameraError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">How to use:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
            <li>Point your camera at a tree or plant</li>
            <li>Tap "Start Scanning" to begin detection</li>
            <li>Hold steady while the AI analyzes the image</li>
            <li>Discover fun facts and environmental benefits!</li>
          </ol>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <h5 className="font-semibold text-green-800 mb-2">💡 Pro Tips:</h5>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• <strong>Point at actual trees:</strong> Don't scan empty space or walls</li>
              <li>• <strong>Hold steady (30%+):</strong> Common trees like Pine, Oak, Mango</li>
              <li>• <strong>Medium scan (50-80%):</strong> Uncommon trees like Neem, Eucalyptus, Peepal</li>
              <li>• <strong>Long scan (80%+):</strong> Rare trees like Banyan, Redwood</li>
              <li>• <strong>Better lighting:</strong> Scan in good light for better detection</li>
              <li>• <strong>Steady hands:</strong> Hold camera steady for accurate results</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            {!isScanning ? (
              <Button 
                onClick={startScanning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!!cameraError}
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button 
                onClick={stopScanning}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            
            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
          
          {/* Manual Tree Selection Button */}
          <Button 
            onClick={() => setShowTreeSelector(true)}
            variant="outline"
            className="w-full"
            disabled={isScanning}
          >
            <TreePine className="w-4 h-4 mr-2" />
            Choose Tree Manually (For Testing)
          </Button>
        </div>
      </CardContent>
      
      {/* Tree Selector Modal */}
      {showTreeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Choose a Tree to Discover</CardTitle>
                <Button 
                  onClick={() => setShowTreeSelector(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TREE_DATABASE.map((tree) => (
                  <Card 
                    key={tree.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleManualTreeSelection(tree)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{tree.name}</h3>
                          <p className="text-sm text-gray-600 italic">{tree.scientificName}</p>
                        </div>
                        <Badge className={getRarityColor(tree.rarity)}>
                          {getRarityIcon(tree.rarity)}
                          <span className="ml-1 capitalize">{tree.rarity}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{tree.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Tap to discover this tree</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default ARTreeScanner;
