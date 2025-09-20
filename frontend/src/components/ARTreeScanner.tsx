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
  // Plant.id specific fields
  commonNames?: string[];
  family?: string;
  genus?: string;
  species?: string;
  edibleParts?: string[];
  watering?: string;
  habitat?: string;
  origin?: string;
  url?: string;
  plantIdData?: any;
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

// Helper functions to generate content from Plant.id data
const generateFunFactsFromPlantData = (plantData: any, details: any): string[] => {
  const facts: string[] = [];
  
  if (details.family) {
    facts.push(`Belongs to the ${details.family} family`);
  }
  
  if (details.genus && details.species) {
    facts.push(`Scientific name: ${details.genus} ${details.species}`);
  }
  
  if (details.edibleParts && details.edibleParts.length > 0) {
    facts.push(`Edible parts: ${details.edibleParts.join(', ')}`);
  }
  
  if (details.habitat) {
    facts.push(`Natural habitat: ${details.habitat}`);
  }
  
  if (details.origin) {
    facts.push(`Native to: ${details.origin}`);
  }
  
  if (details.watering) {
    facts.push(`Watering needs: ${details.watering}`);
  }
  
  // Add some generic plant facts if we have basic info
  if (plantData.name) {
    facts.push(`${plantData.name} is a fascinating plant with unique characteristics`);
  }
  
  return facts.length > 0 ? facts : ['A beautiful plant with many interesting features'];
};

const generateEnvironmentalBenefitsFromPlantData = (plantData: any, details: any): string[] => {
  const benefits: string[] = [];
  
  // Generic environmental benefits
  benefits.push('Produces oxygen through photosynthesis');
  benefits.push('Helps purify the air by absorbing pollutants');
  benefits.push('Provides habitat for wildlife and insects');
  benefits.push('Contributes to carbon sequestration');
  
  if (details.habitat) {
    benefits.push(`Supports local ecosystem in ${details.habitat}`);
  }
  
  if (plantData.rarity === 'rare' || plantData.rarity === 'epic') {
    benefits.push('Rare species - important for biodiversity conservation');
  }
  
  if (details.edibleParts && details.edibleParts.length > 0) {
    benefits.push('Provides food source for humans and animals');
  }
  
  return benefits;
};

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
      await new Promise(resolve => setTimeout(resolve, 200));
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
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob with better quality
    const blob: Blob | null = await new Promise((resolve) => 
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) return;

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const result: TreeDetectionResponse | null = await detectTree(blob, abortRef.current.signal);
      
      if (!result) {
        setIsScanning(false);
        toast({
          title: 'Detection Failed',
          description: 'Unable to process the image. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      console.log('AI Detection Result:', result);

      // Enhanced tree matching logic
      let matched: TreeFact | undefined;
      
      // If we have Plant.id data, create a dynamic tree fact
      if (result.tree && result.tree.plantIdData) {
        const plantData = result.tree;
        const details = plantData.plantIdData.details || {};
        
        // Create dynamic tree fact from Plant.id data
        const dynamicTree: TreeFact = {
          id: plantData.id,
          name: plantData.name,
          scientificName: plantData.scientificName,
          description: plantData.description || 'A beautiful plant discovered through AI identification.',
          funFacts: generateFunFactsFromPlantData(plantData, details),
          environmentalBenefits: generateEnvironmentalBenefitsFromPlantData(plantData, details),
          rarity: plantData.rarity,
          commonNames: plantData.commonNames,
          family: plantData.family,
          genus: plantData.genus,
          species: plantData.species,
          edibleParts: plantData.edibleParts,
          watering: plantData.watering,
          habitat: plantData.habitat,
          origin: plantData.origin,
          url: plantData.url,
          imageUrl: plantData.image,
          plantIdData: plantData.plantIdData
        };
        
        matched = dynamicTree;
      }
      // Try to match by backend-provided tree data
      else if (result.tree) {
        matched = TREE_DATABASE.find(t => 
          t.id === result.tree!.id || 
          t.name.toLowerCase() === result.tree!.name.toLowerCase() ||
          t.scientificName.toLowerCase() === result.tree!.scientificName.toLowerCase()
        );
      }
      
      // If no match, try fuzzy matching with the label
      if (!matched) {
        const labelLower = result.label.toLowerCase();
        matched = TREE_DATABASE.find(t => {
          const nameLower = t.name.toLowerCase();
          const scientificLower = t.scientificName.toLowerCase();
          
          return nameLower.includes(labelLower) ||
                 labelLower.includes(nameLower.replace(' tree', '')) ||
                 scientificLower.includes(labelLower) ||
                 labelLower.includes(scientificLower);
        });
      }
      
      // Check if the detection looks like a tree
      const looksLikeTree = /\b(tree|plant|leaf|bark|branch|foliage|trunk|canopy|forest|wood|green|nature)\b/i.test(result.label);
      const isHighConfidence = (typeof result.confidence === 'number') ? result.confidence >= 0.3 : false;

      // If we have a good match or high confidence plant detection, use it
      if (matched || (looksLikeTree && isHighConfidence)) {
        const picked = matched || TREE_DATABASE[Math.floor(Math.random() * TREE_DATABASE.length)];
        setDetectedTree(picked);
        setIsScanning(false);
        
        const source = result.metadata?.source === 'plant.id' ? 'Plant.id AI' : 'Local Database';
        toast({
          title: '🌳 Plant Discovered!',
          description: `Found a ${picked.name} using ${source}! Learn about its amazing benefits.`,
        });

        // Record the AR tree session
        recordTreeSession(picked, result);
      } else {
        // Show tree selector for manual selection
        setIsScanning(false);
        setShowTreeSelector(true);
        toast({
          title: 'Plant Not Recognized',
          description: 'The AI couldn\'t identify this plant. Choose from our database!',
          variant: 'default'
        });
      }
      
    } catch (error) {
      console.error('Tree detection error:', error);
      setIsScanning(false);
      toast({
        title: 'Detection Error',
        description: 'Something went wrong. Please try again or select manually.',
        variant: 'destructive'
      });
    }
  };

  const recordTreeSession = async (tree: TreeFact, detection: TreeDetectionResponse) => {
    try {
      const duration = Math.max(1, Math.round(scanningProgress * 0.2));
      const baseScore = 10;
      const rarityBonus = tree.rarity === 'rare' ? 40 : tree.rarity === 'uncommon' ? 20 : tree.rarity === 'epic' ? 60 : 10;
      const confidenceBonus = Math.round((detection.confidence || 0.5) * 20);
      
      const body = {
        gameType: 'ar-tree',
        score: baseScore + rarityBonus + confidenceBonus,
        duration,
        level: 1,
        achievements: detection.confidence > 0.8 ? ['perfect_scan'] : [],
        gameData: { 
          treeId: tree.id, 
          treeName: tree.name,
          scientificName: tree.scientificName,
          rarity: tree.rarity,
          confidence: detection.confidence,
          detectedLabel: detection.label
        }
      };

      // Use backend session endpoint if user is authenticated
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.log('User not authenticated, skipping session recording');
        return;
      }

      const response = await fetch('/api/games/session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        console.log('AR tree session recorded successfully');
      }
    } catch (e) {
      console.warn('Failed to record AR tree scan', e);
    }
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
      <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TreePine className="w-6 h-6 text-green-600" />
              <CardTitle className="text-2xl text-green-800">
                🌳 Tree Discovered!
              </CardTitle>
            </div>
            <Badge className={getRarityColor(detectedTree.rarity)}>
              {getRarityIcon(detectedTree.rarity)}
              <span className="ml-1 capitalize">{detectedTree.rarity}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tree Header with Image Placeholder */}
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Tree Image Placeholder */}
              <div className="w-full md:w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border-2 border-green-300">
                {detectedTree.imageUrl ? (
                  <img 
                    src={detectedTree.imageUrl} 
                    alt={detectedTree.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <TreePine className="w-16 h-16 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-700 font-medium">Plant Image</p>
                  </div>
                )}
              </div>
              
              {/* Tree Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {detectedTree.name}
                  </h3>
                  {detectedTree.plantIdData && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Detected
                    </Badge>
                  )}
                </div>
                <p className="text-xl text-gray-600 italic mb-2">
                  {detectedTree.scientificName}
                </p>
                {detectedTree.commonNames && detectedTree.commonNames.length > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    Also known as: {detectedTree.commonNames.join(', ')}
                  </p>
                )}
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {detectedTree.description}
                </p>
                
                {/* Plant.id specific information */}
                {(detectedTree.family || detectedTree.genus || detectedTree.species) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {detectedTree.family && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold text-gray-600">Family:</span>
                        <br />
                        <span className="text-gray-800">{detectedTree.family}</span>
                      </div>
                    )}
                    {detectedTree.genus && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold text-gray-600">Genus:</span>
                        <br />
                        <span className="text-gray-800">{detectedTree.genus}</span>
                      </div>
                    )}
                    {detectedTree.species && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold text-gray-600">Species:</span>
                        <br />
                        <span className="text-gray-800">{detectedTree.species}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fun Facts with Better Layout */}
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-yellow-500" />
              Amazing Fun Facts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detectedTree.funFacts.map((fact, index) => (
                <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-2xl mr-3">🌿</span>
                  <span className="text-gray-700 font-medium">{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Benefits with Icons */}
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TreePine className="w-6 h-6 mr-3 text-green-500" />
              Environmental Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detectedTree.environmentalBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-2xl mr-3">🌱</span>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Care Information (Plant.id specific) */}
          {(detectedTree.edibleParts || detectedTree.watering || detectedTree.habitat || detectedTree.origin) && (
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                Plant Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectedTree.edibleParts && detectedTree.edibleParts.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">🍎 Edible Parts</h5>
                    <p className="text-yellow-700">{detectedTree.edibleParts.join(', ')}</p>
                  </div>
                )}
                {detectedTree.watering && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">💧 Watering Needs</h5>
                    <p className="text-blue-700">{detectedTree.watering}</p>
                  </div>
                )}
                {detectedTree.habitat && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2">🌍 Natural Habitat</h5>
                    <p className="text-green-700">{detectedTree.habitat}</p>
                  </div>
                )}
                {detectedTree.origin && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-purple-800 mb-2">🌏 Native Origin</h5>
                    <p className="text-purple-700">{detectedTree.origin}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tree Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-blue-500" />
              Environmental Impact
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {detectedTree.rarity === 'rare' ? '60+' : 
                   detectedTree.rarity === 'uncommon' ? '40+' : 
                   detectedTree.rarity === 'epic' ? '80+' : '20+'}
                </div>
                <div className="text-sm text-gray-600">CO2 Absorbed (lbs/year)</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-green-600">
                  {detectedTree.rarity === 'rare' ? '15+' : 
                   detectedTree.rarity === 'uncommon' ? '8+' : 
                   detectedTree.rarity === 'epic' ? '20+' : '4+'}
                </div>
                <div className="text-sm text-gray-600">People Oxygenated</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-purple-600">
                  {detectedTree.rarity === 'rare' ? '500+' : 
                   detectedTree.rarity === 'uncommon' ? '200+' : 
                   detectedTree.rarity === 'epic' ? '1000+' : '100+'}
                </div>
                <div className="text-sm text-gray-600">Species Supported</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-orange-600">
                  {detectedTree.rarity === 'rare' ? '2000+' : 
                   detectedTree.rarity === 'uncommon' ? '500+' : 
                   detectedTree.rarity === 'epic' ? '5000+' : '100+'}
                </div>
                <div className="text-sm text-gray-600">Years Lifespan</div>
              </div>
            </div>
          </div>

          {/* Learn More Link */}
          {detectedTree.url && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-500" />
                Learn More
              </h4>
              <p className="text-gray-700 mb-4">
                Discover more detailed information about this plant from our trusted sources.
              </p>
              <a 
                href={detectedTree.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                View Detailed Information
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={resetScanner}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Another Tree
            </Button>
            <Button 
              onClick={() => setShowTreeSelector(true)}
              variant="outline"
              className="flex-1"
            >
              <TreePine className="w-4 h-4 mr-2" />
              Browse All Trees
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Close Scanner
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
          
          {/* Demo Mode and Manual Selection */}
          <div className="space-y-3">
            <Button 
              onClick={() => setShowTreeSelector(true)}
              variant="outline"
              className="w-full"
              disabled={isScanning}
            >
              <TreePine className="w-4 h-4 mr-2" />
              Choose Tree Manually (For Testing)
            </Button>
            
            <Button 
              onClick={() => {
                // Demo mode - simulate a random tree detection
                const randomTree = TREE_DATABASE[Math.floor(Math.random() * TREE_DATABASE.length)];
                setDetectedTree(randomTree);
                toast({
                  title: '🌳 Demo Mode',
                  description: `Simulated detection of ${randomTree.name}!`,
                });
              }}
              variant="outline"
              className="w-full"
              disabled={isScanning}
            >
              <Zap className="w-4 h-4 mr-2" />
              Demo Mode (Simulate Detection)
            </Button>
          </div>
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
