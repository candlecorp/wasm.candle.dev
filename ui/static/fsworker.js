self.onmessage = async (e) => {
	const path = e.data.path;

	try {
		const response = await fetch(path);
		if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);

		const contentLength = response.headers.get('Content-Length');
		const totalSize = contentLength ? parseInt(contentLength, 10) : undefined;
		if (totalSize === undefined || isNaN(totalSize))
			throw new Error('Content-Length header is missing or invalid');

		const url = new URL(path);
		const segments = url.pathname.split('/');
		const filename = segments[segments.length - 1];

		const root = await navigator.storage.getDirectory();
		let fileHandle;
		try {
			fileHandle = await root.getFileHandle(filename);
			const file = await fileHandle.getFile();
			if (file.size === totalSize) {
				self.postMessage({ percentage: 100, message: 'File already exists with the expected size.' });
				return;
			}
		} catch (error) {
			// File doesn't exist or another error occurred, proceed to create and download.
			fileHandle = await root.getFileHandle(filename, { create: true });
		}

		const accessHandle = await fileHandle.createSyncAccessHandle();

		const reader = response.body.getReader();
		let receivedSize = 0;
		let position = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			await accessHandle.write(value, { at: position });
			position += value.length;
			receivedSize += value.length;

			const percentage = Math.round((receivedSize / totalSize) * 100);
			self.postMessage({ percentage });
		}

		await accessHandle.flush();
		accessHandle.close();
	} catch (error) {
		console.error('Error downloading file:', error);
		self.postMessage({ error: error.message });
	}
};
