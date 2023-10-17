import { instantiateComponentWorker } from '$lib/workers';
import { Packet, type WasmRsComponent } from '@candlecorp/wick';
import { decode, encode } from '@msgpack/msgpack';
import { Observable, from, Subject } from 'rxjs';

let component: WasmRsComponent | undefined;

interface Detection {
	confidence: number;
	keypoints: number[];
	xmax: number;
	xmin: number;
	ymax: number;
	ymin: number;
}

export function cleanup() {
	if (component) {
		component.terminate();
		component = undefined;
	}
}

export class Processor {
	buffer: HTMLCanvasElement;
	bufferCtx: CanvasRenderingContext2D;
	imageCanvas: HTMLCanvasElement;
	imageContext: CanvasRenderingContext2D;
	width: number = 0;
	height: number = 0;
	factor: number = 2;

	previousTimeStamp = 0;
	start: number | undefined;

	constructor(private subject: Subject<Packet>, private observable: Observable<Packet>) {
		this.imageCanvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
		this.imageContext = this.imageCanvas.getContext('2d')!;
		this.buffer = document.getElementById('bufferCanvas') as HTMLCanvasElement;
		this.bufferCtx = this.buffer.getContext('2d')!;
		const size = this.imageCanvas.width * this.imageCanvas.height;
		const target = 480 * 320;
		const multiple = size / target;

		this.factor = Math.max(1, Math.floor(multiple));
		console.log({ multiple, factor: this.factor });

		this.buffer.width = this.imageCanvas.width / this.factor;
		this.buffer.height = this.imageCanvas.height / this.factor;
		const ctx = this.imageContext;
		const factor = this.factor;

		this.observable.subscribe({
			next(packet) {
				if (!packet.data) {
					console.log('no data');
					return;
				}

				const boxes = decode(packet.data) as [string, Detection][];
				for (const box of boxes) {
					const [label, detection] = box;
					const { xmin, ymin, xmax, ymax } = detection;
					ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
					ctx.beginPath();
					ctx.rect(xmin * factor, ymin * factor, (xmax - xmin) * factor, (ymax - ymin) * factor);
					ctx.lineWidth = 4;
					ctx.strokeStyle = 'white';
					ctx.stroke();
					ctx.font = '34pt Arial';
					const metrics = ctx.measureText(label);
					ctx.fillStyle = 'white';
					ctx.fillRect(
						xmin * factor,
						ymin * factor - metrics.fontBoundingBoxAscent - 6,
						metrics.width + 10,
						metrics.fontBoundingBoxAscent + 5
					);
					ctx.fillStyle = 'red';
					ctx.fillText(label, xmin * factor + 5, ymin * factor - 10);
				}
			},
			complete() {
				console.log('done');
			},
			error(err) {
				console.log('error', err);
			}
		});
		this.processFrame();
	}

	static async detect(model: string): Promise<Processor> {
		if (!component) {
			const c = await instantiateComponentWorker('/components/yolo.signed.wasm');
			component = c;
		}
		const instance = await component.instantiate({
			config: {
				model_dir: '/',
				model: `${model}.safetensors`
			}
		});

		const subject = new Subject<Packet>();
		const observer = instance.invoke('detect', from(subject), {
			confidence: 0.25,
			iou: 0.45
		});

		return new Processor(subject, observer);
	}

	processFrame() {
		this.imageContext.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);

		this.bufferCtx.drawImage(this.imageCanvas, 0, 0, this.buffer.width, this.buffer.height);

		const png = this.buffer.toDataURL('image/png');
		const prefix = 'data:image/png;base64,';
		const base64 = png.slice(prefix.length);
		this.subject.next(new Packet('image_data', encode(base64)));
		this.subject.next(Packet.Done('image_data'));
	}
}
