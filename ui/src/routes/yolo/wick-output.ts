import type { Line } from '../../components/Terminal.svelte';

export const cli: Line[] = [
	{
		command:
			'wick invoke candle_ml/yolo:0.0.2 detect --with=@config.json -- --image_data=@soccer.jpg',
		output: [
			{
				payload: {
					value: [
						[
							'person',
							{
								confidence: 0.9256853461265564,
								keypoints: [],
								xmax: 235.46990966796875,
								xmin: 69.84808349609375,
								ymax: 385.51068115234375,
								ymin: 70.73658752441406
							}
						],
						[
							'person',
							{
								confidence: 0.915441632270813,
								keypoints: [],
								xmax: 396.18756103515625,
								xmin: 186.5444641113812,
								ymax: 392.3243408203125,
								ymin: 37.34172058105469
							}
						],
						[
							'person',
							{
								confidence: 0.9087674617767334,
								keypoints: [],
								xmax: 613,
								xmin: 462.0843505859375,
								ymax: 373.789306640625,
								ymin: 23.754322052001953
							}
						],
						[
							'person',
							{
								confidence: 0.5383780598640442,
								keypoints: [],
								xmax: 363.3480224609375,
								xmin: 325.07373046875,
								ymax: 143.6885070807812,
								ymin: 60.6527099609375
							}
						],
						[
							'person',
							{
								confidence: 0.2716786563396454,
								keypoints: [],
								xmax: 562.831787109375,
								xmin: 466.9012756347656,
								ymax: 224.9160461425712,
								ymin: 22.33010482788086
							}
						],
						[
							'car',
							{
								confidence: 0.7425552010536194,
								keypoints: [],
								xmax: 482.6632995605469,
								xmin: 355.2928771972656,
								ymax: 137.7826385498047,
								ymin: 68.53266143798828
							}
						],
						[
							'car',
							{
								confidence: 0.6876348853111267,
								keypoints: [],
								xmax: 241.87548828125,
								xmin: 141.7071075439453,
								ymax: 136.7369689941462,
								ymin: 76.62179565429688
							}
						],
						[
							'sports ball',
							{
								confidence: 0.9567586183547974,
								keypoints: [],
								xmax: 126.02123260498047,
								xmin: 66.91826629638672,
								ymax: 425.0271301269531,
								ymin: 370.4414367675781
							}
						]
					]
				},
				port: 'output'
			}
		]
			.map((json) => JSON.stringify(json, null, 2))
			.join('\n')
	}
];
