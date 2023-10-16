import type { BundleEntry } from '../../components/BundleDownload.svelte';

export const bundles: Record<string, BundleEntry> = {
	yolov8n: {
		label: 'yolov8n (7mb)',
		files: [
			{
				path: 'yolov8n.safetensors',
				url: 'https://huggingface.co/lmz/candle-yolo-v8/resolve/main/yolov8n.safetensors'
			}
		]
	}
};
