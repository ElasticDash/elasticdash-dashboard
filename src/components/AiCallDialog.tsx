'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface AiCallDialogProps {
	open: boolean;
	onClose: () => void;
	aiCalls: any[];
}

const AiCallDialog: React.FC<AiCallDialogProps> = ({ open, onClose, aiCalls }) => {
	const [selectedStep, setSelectedStep] = React.useState<any | null>(null);

	useEffect(() => {
		if (!open) setSelectedStep(null);
	}, [open]);

	// Helper to pretty-print JSON or string, with \n handling
	const renderJsonOrString = (data: any, maxHeight = 240) => {
		let parsed = data;

		if (typeof data === 'string') {
			try {
				parsed = JSON.parse(data);
			} catch {
				// keep as string
			}
		}

		if (typeof parsed === 'object') {
			return (
				<pre
					style={{
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
						fontSize: 13,
						maxHeight,
						overflow: 'auto',
						margin: 0
					}}
				>
					{JSON.stringify(parsed, null, 2)}
				</pre>
			);
		}

		// If string, replace \n with real newlines
		return (
			<pre
				style={{
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word',
					fontSize: 13,
					maxHeight,
					overflow: 'auto',
					margin: 0
				}}
			>
				{String(parsed).replace(/\\n/g, '\n')}
			</pre>
		);
	};

	// Helper to check if input is a message array format
	const isMessageArray = (input: any) => {
		if (!input) return false;

		let obj = input;

		if (typeof input === 'string') {
			try {
				obj = JSON.parse(input);
			} catch {
				return false;
			}
		}

		return (
			obj &&
			typeof obj === 'object' &&
			Array.isArray(obj.messages) &&
			obj.messages.every((m: any) => m.role && m.content)
		);
	};

	// Message viewer for input with collapsible blocks
	const MessageViewer = ({ input }: { input: any }) => {
		let obj = input;

		if (typeof input === 'string') {
			try {
				obj = JSON.parse(input);
			} catch {
				return renderJsonOrString(input);
			}
		}

		if (!obj || !Array.isArray(obj.messages)) return renderJsonOrString(input);

		const [expanded, setExpanded] = useState(() => obj.messages.map(() => false));

		const toggle = (idx: number) => {
			setExpanded((prev) => prev.map((v, i) => (i === idx ? !v : v)));
		};

		return (
			<div
				style={{
					maxHeight: 256,
					overflow: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					background: '#fff',
					padding: 4
				}}
			>
				{obj.messages.map((msg: any, idx: number) => (
					<div
						key={idx}
						style={{
							background: '#f5f5f5',
							borderRadius: 6,
							borderLeft: `4px solid ${msg.role === 'user' ? '#1976d2' : '#43a047'}`
						}}
					>
						<div
							style={{
								fontWeight: 600,
								color: msg.role === 'user' ? '#1976d2' : '#43a047',
								marginBottom: 4,
								cursor: 'pointer',
								padding: 8,
								display: 'flex',
								alignItems: 'center',
								userSelect: 'none'
							}}
							onClick={() => toggle(idx)}
						>
							<span style={{ marginRight: 8 }}>{expanded[idx] ? '▼' : '▶'}</span>
							{msg.role}
						</div>
						{expanded[idx] && (
							<div
								style={{
									whiteSpace: 'pre-wrap',
									fontSize: 13,
									padding: 8,
									borderTop: '1px solid #e0e0e0'
								}}
							>
								{String(msg.content).replace(/\\n/g, '\n')}
							</div>
						)}
					</div>
				))}
			</div>
		);
	};

	const [showMessageView, setShowMessageView] = React.useState(true);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>AI Calls</DialogTitle>
			<DialogContent>
				{selectedStep ? (
					<div style={{ padding: 16 }}>
						<div style={{ fontWeight: 600, color: '#1976d2', fontSize: 18, marginBottom: 8 }}>
							Step {selectedStep.stepOrder ?? ''} Details
						</div>
						<div style={{ marginBottom: 12 }}>
							<b>Input:</b>
							<div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
								{isMessageArray(selectedStep.input) && (
									<Button
										size="small"
										variant={showMessageView ? 'contained' : 'outlined'}
										sx={{ mr: 1 }}
										onClick={() => setShowMessageView(true)}
									>
										Message View
									</Button>
								)}
								<Button
									size="small"
									variant={!showMessageView ? 'contained' : 'outlined'}
									onClick={() => setShowMessageView(false)}
								>
									Plan JSON
								</Button>
							</div>
							<div
								style={{
									background: '#f5f5f5',
									borderRadius: 6,
									padding: 8,
									marginTop: 4,
									maxHeight: 272,
									overflow: 'auto'
								}}
							>
								{isMessageArray(selectedStep.input) && showMessageView ? (
									<MessageViewer input={selectedStep.input} />
								) : (
									renderJsonOrString(selectedStep.input)
								)}
							</div>
						</div>
						<div>
							<b>Output:</b>
							<div
								style={{
									background: '#f5f5f5',
									borderRadius: 6,
									padding: 8,
									marginTop: 4,
									maxHeight: 240,
									overflow: 'auto'
								}}
							>
								{renderJsonOrString(selectedStep.expectedOutput ?? selectedStep.output)}
							</div>
						</div>
					</div>
				) : (
					<div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: 24 }}>
						{aiCalls.map((call, idx) => (
							<React.Fragment key={call.id}>
								<div
									style={{
										minWidth: 120,
										minHeight: 80,
										background: '#f5f5f5',
										border: '2px solid #1976d2',
										borderRadius: 8,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										marginRight: 16,
										position: 'relative',
										boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
										cursor: 'pointer',
										transition: 'box-shadow 0.2s'
									}}
									onClick={() => setSelectedStep(call)}
								>
									<div style={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>
										Step {call.stepOrder ?? idx + 1}
									</div>
									<div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>ID: {call.id}</div>
								</div>
								{idx < aiCalls.length - 1 && (
									<div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
										<svg
											width="32"
											height="24"
											style={{ display: 'block' }}
										>
											<line
												x1="0"
												y1="12"
												x2="28"
												y2="12"
												stroke="#1976d2"
												strokeWidth="2"
												markerEnd="url(#arrowhead)"
											/>
											<defs>
												<marker
													id="arrowhead"
													markerWidth="6"
													markerHeight="6"
													refX="6"
													refY="3"
													orient="auto"
													markerUnits="strokeWidth"
												>
													<path
														d="M0,0 L0,6 L6,3 Z"
														fill="#1976d2"
													/>
												</marker>
											</defs>
										</svg>
									</div>
								)}
							</React.Fragment>
						))}
					</div>
				)}
			</DialogContent>
			<DialogActions>
				{selectedStep ? (
					<Button
						onClick={() => setSelectedStep(null)}
						color="primary"
						variant="outlined"
					>
						Back
					</Button>
				) : null}
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AiCallDialog;
