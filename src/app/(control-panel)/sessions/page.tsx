'use client';

import { useState } from 'react';
import SessionTable from '@/components/SessionTable';

const PROJECT_ID = 'project-id'; // TODO: Replace with actual projectId logic if needed
const PAGE_SIZE = 10;

const SessionsPage = () => {
	const [offset, setOffset] = useState(0);

	const handlePrev = () => setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
	const handleNext = () => setOffset((prev) => prev + PAGE_SIZE);

	return (
		<div className="p-8">
			<h1 className="mb-4 text-2xl font-bold">Sessions</h1>
			<SessionTable
				limit={PAGE_SIZE}
				offset={offset}
			/>
			<div className="mt-4 flex gap-2">
				<button
					className="rounded border px-3 py-1 disabled:opacity-50"
					onClick={handlePrev}
					disabled={offset === 0}
				>
					Previous
				</button>
				<button
					className="rounded border px-3 py-1"
					onClick={handleNext}
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default SessionsPage;
