import express from 'express';

const router = express.Router();

// POST /api/ai/tree-detect
router.post('/tree-detect', async (req, res) => {
	try {
		const { imageBase64 } = req.body as { imageBase64?: string };
		if (!imageBase64) {
			return res.status(400).json({ error: 'imageBase64 is required' });
		}
    // Perplexity configuration via .env
    // Expected envs:
    // PERPLEXITY_API_KEY: your api key
    // PERPLEXITY_MODEL: optional, defaults to vision model
    const aiKey = process.env.PERPLEXITY_API_KEY || process.env.AI_API_KEY;
    const model = process.env.PERPLEXITY_MODEL || 'sonar-large-vision';
    if (!aiKey) {
			// For now, return a mocked response to unblock frontend
			return res.json({ label: 'Neem Tree', confidence: 0.9 });
		}

		// Convert data URL to raw base64 without prefix if needed
    const stripped = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    // Call Perplexity Chat Completions with image input
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
            content: 'You are a precise botanist. Identify the tree species from the image. Respond with a concise JSON: {"label": string, "confidence": number between 0 and 1}. If unsure, guess best effort with lower confidence.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify the tree in this photo.' },
              { type: 'image_base64', image_base64: stripped }
            ]
          }
        ],
        temperature: 0.2,
      })
    });

		if (!aiResp.ok) {
			return res.status(502).json({ error: 'AI service failed' });
		}

		const data: any = await aiResp.json();
    // Perplexity returns choices with message content. Try to parse JSON from the content.
    const content = data?.choices?.[0]?.message?.content ?? '';
    let label = 'Unknown';
    let confidence = 0;
    try {
      // If content is JSON, parse directly
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      if (parsed && typeof parsed.label === 'string') {
        label = parsed.label;
        if (typeof parsed.confidence === 'number') confidence = parsed.confidence;
      }
    } catch {
      // If it's text, extract best-effort label (first capitalized words)
      if (typeof content === 'string') {
        const match = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/);
        if (match) label = match[0];
      }
    }

		// Simple in-memory tree database (could be moved to Mongo later)
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

		const normalized = label.toLowerCase();
		const match = TREE_DB.find(t => normalized.includes(t.name.toLowerCase().replace(' tree','')) || t.name.toLowerCase().includes(normalized));

		return res.json({
			label,
			confidence,
			tree: match || null
		});
	} catch (e) {
		console.error('AI detect error:', e);
		return res.status(500).json({ error: 'Detection failed' });
	}
});

export default router;


