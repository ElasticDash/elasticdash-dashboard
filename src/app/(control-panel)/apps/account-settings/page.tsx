'use client';

import { useState, useEffect } from 'react';
import { getDatabaseConnection, updateDatabaseConnection } from './dbApi';
import { Typography, Paper, Divider } from '@mui/material';
import { Box, lighten } from '@mui/system';
import EditableField from './components/EditableField';
import EditablePasswordField from './components/EditablePasswordField';

/**
 * Account Settings Page
 */
export default function AccountSettingsPage() {
	const [dbConnectString, setDbConnectString] = useState('');
	const [dbError, setDbError] = useState('');
	const [dbSuccess, setDbSuccess] = useState('');
	const [email, setEmail] = useState('user@example.com');

	useEffect(() => {
		getDatabaseConnection()
			.then((res) => {
				console.log('res: ', res);
				setDbConnectString(res?.result.connectionString || '');
			})
			.catch((err) => {
				setDbError(err.message || 'Failed to fetch database connection');
			});
	}, []);

	const handleDbConnectStringSave = async (value: string) => {
		setDbError('');
		setDbSuccess('');
		try {
			await updateDatabaseConnection(value);
			setDbConnectString(value);
			setDbSuccess('Database connection updated successfully');
		} catch (err: any) {
			setDbError(err.message || 'Failed to update database connection');
		}
	};

	const handleEmailSave = (value: string) => {
		setEmail(value);
		console.log('Email saved:', value);
		// TODO: Add API call to save to backend
	};



	return (
		<Box className="flex flex-col w-full p-6 sm:p-8 md:p-12">
			<Typography
				variant="h4"
				className="mb-8 font-bold"
			>
				Account Settings
			</Typography>

			{/* Database Connect String Section */}
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
					Database Configuration
				</Typography>
				<Divider className="mb-4" />
				<EditableField
					label="Database Connect String"
					value={dbConnectString}
					onSave={handleDbConnectStringSave}
					multiline
				/>
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
