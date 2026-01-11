'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { lighten } from '@mui/material/styles';
import EditableField from './components/EditableField';
import EditablePasswordField from './components/EditablePasswordField';

/**
 * Account Settings Page
 */
export default function AccountSettingsPage() {
	const [dbConnectString, setDbConnectString] = useState('mongodb://localhost:27017/mydb');
	const [email, setEmail] = useState('user@example.com');

	const handleDbConnectStringSave = (value: string) => {
		setDbConnectString(value);
		console.log('Database Connect String saved:', value);
		// TODO: Add API call to save to backend
	};

	const handleEmailSave = (value: string) => {
		setEmail(value);
		console.log('Email saved:', value);
		// TODO: Add API call to save to backend
	};

	const handlePasswordSave = (newPassword: string, confirmPassword: string) => {
		console.log('Password saved');
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
				/>
				<EditablePasswordField
					label="Password"
					onSave={handlePasswordSave}
				/>
			</Paper>
		</Box>
	);
}
