import express from 'express';

const router = express.Router();

// POST /api/ai/tree-detect
router.post('/tree-detect', async (req, res) => {
	try {
		const { imageBase64 } = req.body as { imageBase64?: string };
		if (!imageBase64) {
			return res.status(400).json({ error: 'imageBase64 is required' });
		}

		// Convert data URL to raw base64 without prefix if needed
		const stripped = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

		// Use Plant.id API for accurate plant identification
		const plantIdApiKey = process.env.PLANT_ID_API_KEY || 'YW6cI7YPUAmj0pglzbtNRdTLccU8H28vpzJrZMRELCniD9UxP4';
		
		let plantData = null;
		let label = 'Unknown Plant';
		let confidence = 0;

		try {
			// Call Plant.id API
			const plantIdResp = await fetch('https://api.plant.id/v3/identification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Api-Key': plantIdApiKey
				},
				body: JSON.stringify({
					images: [stripped],
					modifiers: ['crops_fast', 'similar_images', 'plant_net'],
					plant_language: 'en',
					plant_details: [
						'common_names',
						'url',
						'name_authority',
						'wiki_description',
						'taxonomy',
						'edible_parts',
						'watering',
						'propagation_methods',
						'flower',
						'fruit',
						'leaf',
						'seeds',
						'stem',
						'root',
						'habitat',
						'origin',
						'family',
						'genus',
						'species',
						'binomial_name',
						'plant_net_id',
						'plant_net_score',
						'gbif_id',
						'inaturalist_id',
						'image',
						'license_name',
						'license_url',
						'plant_net_images',
						'plant_net_similar_images'
					]
				})
			});

			if (plantIdResp.ok) {
				const plantIdData = await plantIdResp.json();
				console.log('Plant.id API Response:', JSON.stringify(plantIdData, null, 2));
				
				if (plantIdData.suggestions && plantIdData.suggestions.length > 0) {
					const suggestion = plantIdData.suggestions[0];
					plantData = suggestion;
					label = suggestion.plant_name || suggestion.plant_details?.common_names?.[0] || 'Unknown Plant';
					confidence = suggestion.probability || 0;
					
					// Extract additional details
					const details = suggestion.plant_details;
					if (details) {
						plantData.details = {
							commonNames: details.common_names || [],
							binomialName: details.binomial_name || details.species || label,
							family: details.family,
							genus: details.genus,
							species: details.species,
							description: details.wiki_description?.value || details.wiki_description?.extract,
							edibleParts: details.edible_parts || [],
							watering: details.watering,
							habitat: details.habitat,
							origin: details.origin,
							image: details.image?.value,
							url: details.url?.value
						};
					}
				}
			} else {
				console.warn('Plant.id API failed:', plantIdResp.status, await plantIdResp.text());
			}
		} catch (plantIdError) {
			console.warn('Plant.id API error:', plantIdError);
		}

		// Fallback to Perplexity if Plant.id fails or confidence is low
		if (!plantData || confidence < 0.3) {
			const aiKey = process.env.PERPLEXITY_API_KEY || process.env.AI_API_KEY;
			const model = process.env.PERPLEXITY_MODEL || 'sonar-large-vision';
			
			if (aiKey) {
				try {
					const aiResp = await fetch('https://api.perplexity.ai/chat/completions', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${aiKey}`
						},
						body: JSON.stringify({
							model,
							messages: [
								{
									role: 'system',
									content: 'You are a precise botanist. Identify the plant species from the image. Respond with a concise JSON: {"label": string, "confidence": number between 0 and 1}. If unsure, guess best effort with lower confidence.'
								},
								{
									role: 'user',
									content: [
										{ type: 'text', text: 'Identify the plant in this photo.' },
										{ type: 'image_base64', image_base64: stripped }
									]
								}
							],
							temperature: 0.2,
						})
					});

					if (aiResp.ok) {
						const data: any = await aiResp.json();
						const content = data?.choices?.[0]?.message?.content ?? '';
						try {
							const parsed = typeof content === 'string' ? JSON.parse(content) : content;
							if (parsed && typeof parsed.label === 'string') {
								label = parsed.label;
								confidence = Math.max(confidence, parsed.confidence || 0);
							}
						} catch {
							if (typeof content === 'string') {
								const match = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
								if (match) label = match[0];
							}
						}
					}
				} catch (aiError) {
					console.warn('Perplexity API error:', aiError);
				}
			}
		}

		// Enhanced tree database with better matching
		const TREE_DB = [
			{ id: 'neem-1', name: 'Neem Tree', scientificName: 'Azadirachta indica', rarity: 'uncommon' },
			{ id: 'mango-1', name: 'Mango Tree', scientificName: 'Mangifera indica', rarity: 'common' },
			{ id: 'banyan-1', name: 'Banyan Tree', scientificName: 'Ficus benghalensis', rarity: 'rare' },
			{ id: 'oak-1', name: 'Oak Tree', scientificName: 'Quercus robur', rarity: 'common' },
			{ id: 'pine-1', name: 'Pine Tree', scientificName: 'Pinus sylvestris', rarity: 'common' },
			{ id: 'eucalyptus-1', name: 'Eucalyptus Tree', scientificName: 'Eucalyptus globulus', rarity: 'uncommon' },
			{ id: 'peepal-1', name: 'Peepal Tree', scientificName: 'Ficus religiosa', rarity: 'uncommon' },
			{ id: 'redwood-1', name: 'Redwood Tree', scientificName: 'Sequoia sempervirens', rarity: 'rare' }
		];

		// If we have Plant.id data, use it directly
		if (plantData && plantData.details) {
			const details = plantData.details;
			const plantInfo = {
				id: `plant-id-${Date.now()}`,
				name: label,
				scientificName: details.binomialName || details.species || label,
				rarity: confidence > 0.8 ? 'rare' : confidence > 0.6 ? 'uncommon' : 'common',
				description: details.description || 'A beautiful plant discovered through AI identification.',
				commonNames: details.commonNames || [],
				family: details.family,
				genus: details.genus,
				species: details.species,
				edibleParts: details.edibleParts || [],
				watering: details.watering,
				habitat: details.habitat,
				origin: details.origin,
				image: details.image,
				url: details.url,
				plantIdData: plantData
			};

			return res.json({
				label,
				confidence,
				tree: plantInfo,
				metadata: {
					source: 'plant.id',
					matched: true,
					searchTerm: label,
					timestamp: new Date().toISOString(),
					plantIdData: plantData
				}
			});
		}

		// Fallback to local database matching
		const normalized = label.toLowerCase();
		let match = null;
		
		// Try exact matches first
		match = TREE_DB.find(t => 
			t.name.toLowerCase() === normalized ||
			t.scientificName.toLowerCase() === normalized
		);
		
		// Try partial matches
		if (!match) {
			match = TREE_DB.find(t => {
				const nameLower = t.name.toLowerCase();
				const scientificLower = t.scientificName.toLowerCase();
				const nameWithoutTree = nameLower.replace(' tree', '');
				
				return normalized.includes(nameWithoutTree) ||
					   nameWithoutTree.includes(normalized) ||
					   normalized.includes(scientificLower) ||
					   scientificLower.includes(normalized) ||
					   normalized.includes(nameLower) ||
					   nameLower.includes(normalized);
			});
		}
		
		// If still no match, try keyword matching
		if (!match) {
			const keywords = {
				'neem': 'neem-1',
				'azadirachta': 'neem-1',
				'mango': 'mango-1',
				'mangifera': 'mango-1',
				'banyan': 'banyan-1',
				'ficus benghalensis': 'banyan-1',
				'oak': 'oak-1',
				'quercus': 'oak-1',
				'pine': 'pine-1',
				'pinus': 'pine-1',
				'eucalyptus': 'eucalyptus-1',
				'peepal': 'peepal-1',
				'ficus religiosa': 'peepal-1',
				'redwood': 'redwood-1',
				'sequoia': 'redwood-1'
			};
			
			for (const [keyword, treeId] of Object.entries(keywords)) {
				if (normalized.includes(keyword)) {
					match = TREE_DB.find(t => t.id === treeId);
					break;
				}
			}
		}

		// Boost confidence if we found a match
		const finalConfidence = match ? Math.min(0.95, confidence + 0.2) : confidence;

		return res.json({
			label,
			confidence: finalConfidence,
			tree: match || null,
			metadata: {
				source: 'local-database',
				matched: !!match,
				searchTerm: normalized,
				timestamp: new Date().toISOString()
			}
		});
	} catch (e) {
		console.error('AI detect error:', e);
		return res.status(500).json({ error: 'Detection failed' });
	}
});

export default router;


