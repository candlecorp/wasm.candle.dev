import type { Line } from '../../components/Terminal.svelte';

export const cli: Line[] = [
	{
		command: 'cat config.json',
		output: `{
  "patterns": [
    "\\b\\d\\d\\d-\\d\\d-\\d\\d\\d\\d\\b",
    "\\b\\d\\d\\d\\d-\\d\\d\\d\\d-\\d\\d\\d\\d-\\d\\d\\d\\d\\b",
    "\\b[a-zA-Z-.]+@([a-zA-Z-]+.)+[a-zA-Z-]{2,}\\b"
  ]
}`
	},
	{
		command:
			'wick invoke common/redact:0.0.1 --op-with=@config.json regex -- --input="003-68-5339"',
		output: '{"payload":{"value":"XXXXXXXXXXX"},"port":"output"}'
	}
];
