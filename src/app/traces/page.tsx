import { Suspense } from 'react';
import TraceListClient from './TraceListClient';

export default function TraceListPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TraceListClient />
		</Suspense>
	);
}
