'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type EditablePasswordFieldProps = {
	label: string;
	onSave: (newPassword: string, confirmPassword: string) => void;
};

/**
 * EditablePasswordField component with two password inputs for new password and confirmation
 */
export default function EditablePasswordField({ label, onSave }: EditablePasswordFieldProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const handleEdit = () => {
		setNewPassword('');
		setConfirmPassword('');
		setError('');
		setIsEditing(true);
	};

	const handleCancel = () => {
		setNewPassword('');
		setConfirmPassword('');
		setError('');
		setIsEditing(false);
	};

	const handleSave = () => {
		// Basic validation
		if (!newPassword || !confirmPassword) {
			setError('Both fields are required');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		onSave(newPassword, confirmPassword);
		setNewPassword('');
		setConfirmPassword('');
		setError('');
		setIsEditing(false);
	};

	return (
		<Box className="mb-6">
			<Typography
				variant="subtitle2"
				className="mb-2 font-semibold"
				color="text.secondary"
			>
				{label}
			</Typography>
			{!isEditing ? (
				<Box className="flex items-center justify-between">
					<Typography variant="body1">••••••••</Typography>
					<IconButton
						size="small"
						onClick={handleEdit}
						color="primary"
					>
						<FuseSvgIcon size={20}>lucide:pencil</FuseSvgIcon>
					</IconButton>
				</Box>
			) : (
				<Box>
					<TextField
						fullWidth
						type="password"
						label="New Password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						variant="outlined"
						size="small"
						autoFocus
						error={!!error}
						className="mb-3"
					/>
					<TextField
						fullWidth
						type="password"
						label="Confirm Password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						variant="outlined"
						size="small"
						error={!!error}
						helperText={error}
					/>
					<Box className="mt-3 flex gap-2">
						<Button
							variant="contained"
							color="primary"
							size="small"
							onClick={handleSave}
						>
							Submit
						</Button>
						<Button
							variant="outlined"
							size="small"
							onClick={handleCancel}
						>
							Cancel
						</Button>
					</Box>
				</Box>
			)}
		</Box>
	);
}
