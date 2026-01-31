'use client';

import { useState, useEffect } from 'react';
import {
	fetchApiBaseUrl,
	fetchOauthToken,
	updateApiBaseUrl,
	updateOauthToken
} from '@/services/accountSettingsService';
import { fetchLlmConfig, updateLlmConfig } from '@/services/llmSettingsService';
import { Typography, Paper, Divider } from '@mui/material';
import { Box, lighten } from '@mui/system';
import EditableField from './components/EditableField';
import EditablePasswordField from './components/EditablePasswordField';

/**
 * Account Settings Page
 */
export default function AccountSettingsPage() {
	const [apiBaseUrl, setApiBaseUrl] = useState('');
	const [apiBaseUrlError, setApiBaseUrlError] = useState('');
	const [apiBaseUrlSuccess, setApiBaseUrlSuccess] = useState('');

	const [oauthToken, setOauthToken] = useState('');
	const [oauthTokenError, setOauthTokenError] = useState('');
	const [oauthTokenSuccess, setOauthTokenSuccess] = useState('');

	const [llmProviderId, setLlmProviderId] = useState(1); // Only OpenAI for now
	const [llmToken, setLlmToken] = useState('');
	const [llmError, setLlmError] = useState('');
	const [llmSuccess, setLlmSuccess] = useState('');
	const [email, setEmail] = useState('user@example.com');
	// Fetch LLM config
	useEffect(() => {
		fetchLlmConfig()
			.then((res) => {
				setLlmProviderId(res?.result?.llmProviderId || 1);
				setLlmToken(res?.result?.llmToken || '');
			})
			.catch((err) => {
				setLlmError(err.message || 'Failed to fetch LLM config');
			});
	}, []);

	const handleLlmSave = async (token: string) => {
		setLlmError('');
		setLlmSuccess('');
		try {
			await updateLlmConfig({ llmProviderId: 1, llmToken: token });
			setLlmToken(token);
			setLlmSuccess('LLM token updated successfully');
		} catch (err: any) {
			setLlmError(err.message || 'Failed to update LLM token');
		}
	};

	useEffect(() => {
		fetchApiBaseUrl()
			.then((res) => {
				setApiBaseUrl(res?.result || '');
			})
			.catch((err) => {
				setApiBaseUrlError(err.message || 'Failed to fetch API base URL');
			});

		fetchOauthToken()
			.then((res) => {
				setOauthToken(res?.result || '');
			})
			.catch((err) => {
				setOauthTokenError(err.message || 'Failed to fetch OAuth token');
			});
	}, []);

	const handleApiBaseUrlSave = async (value: string) => {
		setApiBaseUrlError('');
		setApiBaseUrlSuccess('');
		try {
			await updateApiBaseUrl(value);
			setApiBaseUrl(value);
			setApiBaseUrlSuccess('API base URL updated successfully');
		} catch (err: any) {
			setApiBaseUrlError(err.message || 'Failed to update API base URL');
		}
	};

	const handleOauthTokenSave = async (value: string) => {
		setOauthToken(value);
		console.log('OAuth token saved:', value);
		try {
			await updateOauthToken(value);
			setOauthToken(value);
			setOauthTokenSuccess('OAuth token updated successfully');
		} catch (err: any) {
			setOauthTokenError(err.message || 'Failed to update OAuth token');
		}
	};

	const handleEmailSave = (value: string) => {
		setEmail(value);
		console.log('Email saved:', value);
		// TODO: Add API call to save to backend
	};

	return (
		<Box className="flex w-full flex-col p-6 sm:p-8 md:p-12">
			<Typography
				variant="h4"
				className="mb-8 font-bold"
			>
				Account Settings
			</Typography>

			{/* API Base URL Section */}
			<Paper
				className="mb-6 p-6"
				elevation={1}
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Typography
					variant="h6"
					className="mb-4 font-semibold"
				>
					API Base URL
				</Typography>
				<Divider className="mb-4" />
				<EditableField
					label="API Base URL"
					value={apiBaseUrl}
					onSave={handleApiBaseUrlSave}
					multiline
				/>
				{apiBaseUrlError && (
					<Typography
						color="error"
						className="mt-2"
					>
						{apiBaseUrlError}
					</Typography>
				)}
				{apiBaseUrlSuccess && (
					<Typography
						color="success.main"
						className="mt-2"
					>
						{apiBaseUrlSuccess}
					</Typography>
				)}
			</Paper>

			{/* OAuth Token Section */}
			<Paper
				className="mb-6 p-6"
				elevation={1}
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Typography
					variant="h6"
					className="mb-4 font-semibold"
				>
					OAuth Token
				</Typography>
				<Divider className="mb-4" />
				<EditableField
					label="OAuth Token"
					value={oauthToken}
					onSave={handleOauthTokenSave}
					type="password"
				/>
				{oauthTokenError && (
					<Typography
						color="error"
						className="mt-2"
					>
						{oauthTokenError}
					</Typography>
				)}
				{oauthTokenSuccess && (
					<Typography
						color="success.main"
						className="mt-2"
					>
						{oauthTokenSuccess}
					</Typography>
				)}
			</Paper>

			{/* LLM Provider & Token Section */}
			<Paper
				className="mb-6 p-6"
				elevation={1}
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Typography
					variant="h6"
					className="mb-4 font-semibold"
				>
					LLM Provider & Token
				</Typography>
				<Divider className="mb-4" />
				<EditableField
					label="Provider"
					value="OpenAI"
					onSave={() => {}}
					editable={false}
				/>
				<EditableField
					label="OpenAI API Key"
					value={llmToken}
					onSave={handleLlmSave}
					type="password"
				/>
				{llmError && (
					<Typography
						color="error"
						className="mt-2"
					>
						{llmError}
					</Typography>
				)}
				{llmSuccess && (
					<Typography
						color="success.main"
						className="mt-2"
					>
						{llmSuccess}
					</Typography>
				)}
			</Paper>

			{/* User Details Section */}
			<Paper
				className="p-6"
				elevation={1}
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Typography
					variant="h6"
					className="mb-4 font-semibold"
				>
					User Details
				</Typography>
				<Divider className="mb-4" />
				<EditableField
					label="Email"
					value={email}
					onSave={handleEmailSave}
					type="text"
					editable={false}
				/>
				<EditablePasswordField label="Password" />
			</Paper>
		</Box>
	);
}
