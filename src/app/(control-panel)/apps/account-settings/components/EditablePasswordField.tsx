'use client';

import { useState } from 'react';
import { updatePassword } from '../api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type EditablePasswordFieldProps = {
	label: string;
};

/**
 * EditablePasswordField component with two password inputs for new password and confirmation
 */
export default function EditablePasswordField({ label }: EditablePasswordFieldProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

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

	const handleSave = async () => {
		setError('');
		setSuccess('');

		// Basic validation
		if (!oldPassword || !newPassword || !confirmPassword) {
			setError('All fields are required');
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

		setLoading(true);
		try {
			await updatePassword({ oldPassword, password: newPassword });
			setSuccess('Password updated successfully');
			setIsEditing(false);
			setOldPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (err: any) {
			setError(err.message || 'Failed to update password');
		} finally {
			setLoading(false);
		}
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
						label="Old Password"
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						variant="outlined"
						size="small"
						autoFocus
						error={!!error}
						className="mb-3"
					/>
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
						helperText={error || success}
					/>
					<Box className="mt-3 flex gap-2">
						<Button
							variant="contained"
							color="primary"
							size="small"
							onClick={handleSave}
							disabled={loading}
						>
							{loading ? 'Saving...' : 'Submit'}
						</Button>
						<Button
							variant="outlined"
							size="small"
							onClick={handleCancel}
							disabled={loading}
						>
							Cancel
						</Button>
					</Box>
				</Box>
			)}
		</Box>
	);
}
