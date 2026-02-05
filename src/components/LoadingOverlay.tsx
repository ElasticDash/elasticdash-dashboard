'use client';
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingOverlayProps {
	message?: string;
	fullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...', fullScreen = false }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
				...(fullScreen
					? {
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(255, 255, 255, 0.9)',
							zIndex: 9999
						}
					: {
							minHeight: 200,
							width: '100%',
							height: '100%'
						})
			}}
		>
			<CircularProgress size={fullScreen ? 60 : 40} />
			<Typography
				variant={fullScreen ? 'h6' : 'body1'}
				color="text.secondary"
			>
				{message}
			</Typography>
		</Box>
	);
};

export default LoadingOverlay;
