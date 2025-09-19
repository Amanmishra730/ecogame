// Simple AI service client to send camera frames to backend for detection

export interface TreeDetectionResponse {
	label: string;
	confidence: number; // 0..1
	metadata?: Record<string, unknown>;
	tree?: {
		id: string;
		name: string;
		scientificName: string;
		rarity: 'common' | 'uncommon' | 'rare' | 'epic' | string;
	} | null;
}

// Allow overriding the backend base URL via Vite env
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
const AI_TREE_DETECT_ENDPOINT = `${API_BASE}/api/ai/tree-detect`;

export async function detectTree(imageBlob: Blob, abortSignal?: AbortSignal): Promise<TreeDetectionResponse | null> {
	// Convert blob to base64 for simple JSON transport
	const base64 = await new Promise<string>((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(String(reader.result));
		reader.readAsDataURL(imageBlob);
	});

	try {
		const response = await fetch(AI_TREE_DETECT_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ imageBase64: base64 }),
			signal: abortSignal
		});

		if (!response.ok) {
			throw new Error(`AI request failed: ${response.status}`);
		}

		const data = await response.json();
		// Expecting { label: string, confidence: number, metadata?: {} }
		if (!data || typeof data.label !== 'string') throw new Error('Invalid AI response');
		return {
			label: data.label,
			confidence: typeof data.confidence === 'number' ? data.confidence : 0,
			metadata: data.metadata || {},
			tree: data.tree || null
		};
	} catch (err) {
		// Graceful demo fallback so AR flow continues even if backend is down
		console.warn('AI detect failed, using fallback:', err);
		return {
			label: 'Neem Tree',
			confidence: 0.9,
			metadata: { fallback: true }
		};
	}
}


