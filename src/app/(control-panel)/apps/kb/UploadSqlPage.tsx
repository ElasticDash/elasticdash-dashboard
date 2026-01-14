import { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, LinearProgress, Alert } from '@mui/material';

export default function UploadSqlPage() {
	const [file, setFile] = useState<File | null>(null);
	const [ddlText, setDdlText] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');
	const [preview, setPreview] = useState('');

	// TODO: Replace with actual projectId/databaseId selection logic
	const projectId = 1;
	const databaseId = 1;

	const handleFile = (f: File | null) => {
		setError('');
		setSuccess('');
		setFile(f);

		if (f) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				const text = ev.target?.result as string;
				setDdlText(text);
				setPreview(text.split('\n').slice(0, 20).join('\n'));
			};
			reader.onerror = () => setError('Failed to read file');
			reader.readAsText(f);
		} else {
			setDdlText('');
			setPreview('');
		}
	};

	const dragRef = useRef<HTMLDivElement>(null);
	const [dragActive, setDragActive] = useState(false);

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!ddlText) {
			setError('No SQL content to upload');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const res = await fetch('/project/kb/upload-sql', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectId, databaseId, ddlText })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err?.message || 'Upload failed');
			}

			setSuccess('SQL uploaded and processed successfully!');
		} catch (err: any) {
			setError(err.message || 'Upload failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			className="flex flex-col items-center p-8"
			maxWidth={600}
			mx="auto"
		>
			<Typography
				variant="h5"
				className="mb-4 font-bold"
			>
				Upload SQL File
			</Typography>
			<Paper
				className="mb-4 w-full p-6"
				elevation={2}
			>
				<div
					ref={dragRef}
					onDragEnter={handleDrag}
					onDragOver={handleDrag}
					onDragLeave={handleDrag}
					onDrop={handleDrop}
					style={{
						border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
						borderRadius: 8,
						padding: 32,
						textAlign: 'center',
						background: dragActive ? '#e3f2fd' : '#fafafa',
						cursor: 'pointer',
						marginBottom: 16
					}}
					onClick={() => {
						if (loading) return;

						const input = document.createElement('input');
						input.type = 'file';
						input.accept = '.sql';
						input.onchange = (e: any) => {
							handleFile(e.target.files?.[0] || null);
						};
						input.click();
					}}
				>
					{file ? (
						<Typography variant="subtitle1">Selected file: {file.name}</Typography>
					) : (
						<Typography
							variant="subtitle1"
							color="text.secondary"
						>
							Drag & drop your .sql file here, or click to select
						</Typography>
					)}
				</div>
				{preview && (
					<Box mt={2}>
						<Typography variant="subtitle2">Preview (first 20 lines):</Typography>
						<Paper
							variant="outlined"
							className="mt-1 p-2"
							style={{ maxHeight: 200, overflow: 'auto', background: '#fafafa' }}
						>
							<pre style={{ margin: 0, fontSize: 13 }}>{preview}</pre>
						</Paper>
					</Box>
				)}
				<Box
					mt={2}
					display="flex"
					gap={2}
				>
					<Button
						variant="contained"
						color="primary"
						onClick={handleUpload}
						disabled={loading || !ddlText}
					>
						Upload
					</Button>
				</Box>
				{loading && <LinearProgress className="mt-2" />}
				{success && (
					<Alert
						severity="success"
						className="mt-2"
					>
						{success}
					</Alert>
				)}
				{error && (
					<Alert
						severity="error"
						className="mt-2"
					>
						{error}
					</Alert>
				)}
			</Paper>
		</Box>
	);
}
