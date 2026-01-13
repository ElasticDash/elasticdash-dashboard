'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type EditableFieldProps = {
	label: string;
	value: string;
	onSave: (value: string) => void;
	type?: 'text' | 'password';
	multiline?: boolean;
	editable?: boolean;
};

/**
 * EditableField component with inline edit mode
 */
export default function EditableField({
	label,
	value,
	onSave,
	type = 'text',
	multiline = false,
	editable = true
}: EditableFieldProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);

	const handleEdit = () => {
		setEditValue(value);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setEditValue(value);
		setIsEditing(false);
	};

	const handleSave = () => {
		onSave(editValue);
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
					<Typography
						variant="body1"
						className="flex-1"
					>
						{type === 'password' ? '••••••••' : value || 'Not set'}
					</Typography>
					{editable && (
						<IconButton
							size="small"
							onClick={handleEdit}
							color="primary"
						>
							<FuseSvgIcon size={20}>lucide:pencil</FuseSvgIcon>
						</IconButton>
					)}
				</Box>
			) : (
				<Box>
					<TextField
						fullWidth
						type={type}
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						variant="outlined"
						size="small"
						multiline={multiline}
						rows={multiline ? 3 : 1}
						autoFocus
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
