'use client';

import React, { useEffect, useState } from 'react';
import { FuseRouteObjectType } from '@fuse/core/FuseLayout/FuseLayout';
import usePathname from '@fuse/hooks/usePathname';
import FuseLoading from '@fuse/core/FuseLoading';
import useNavigate from '@fuse/hooks/useNavigate';

type AuthGuardProps = {
	auth: FuseRouteObjectType['auth'];
	children: React.ReactNode;
	loginRedirectUrl?: string;
};

function AuthGuardRedirect({ auth, children, loginRedirectUrl = '/' }: AuthGuardProps) {
	const navigate = useNavigate();
	const [mounted, setMounted] = useState(false);
	const [accessGranted, setAccessGranted] = useState<boolean>(false);
	const pathname = usePathname();

	useEffect(() => {
		setMounted(true);
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
		const isOnlyGuestAllowed = Array.isArray(auth) && auth.length === 0;

		if (isOnlyGuestAllowed) {
			// Guest-only route (e.g. login):
			if (token) {
				// If logged in, redirect to chat (or main) page
				navigate('/test-results');
				setAccessGranted(false);
			} else {
				// No token, allow access to guest page
				setAccessGranted(true);
			}
		} else {
			// Protected route:
			if (token) {
				setAccessGranted(true);
			} else {
				setAccessGranted(false);

				if (pathname !== '/sign-in') {
					navigate('/sign-in');
				}
			}
		}
	}, [navigate, pathname, auth]);

	if (!mounted) {
		// Prevent hydration mismatch: render nothing until client-side
		return null;
	}

	return accessGranted ? children : <FuseLoading />;
}

// the landing page "/" redirected to /example but the example npt

export default AuthGuardRedirect;
