'use client';

import React, { useEffect, useState } from 'react';
import { fetchSessions, SessionListItem } from '@/services/sessionService';

interface SessionTableProps {
	limit?: number;
	offset?: number;
}

const SessionTable: React.FC<SessionTableProps> = ({ limit = 10, offset = 0 }) => {
	const [sessions, setSessions] = useState<SessionListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		fetchSessions({ limit, offset, filter: null })
			.then((res) => {
				setSessions(res.data);
				setTotal(res.total);
				setError(null);
			})
			.catch((err) => {
				setError(err.message || 'Failed to fetch sessions');
			})
			.finally(() => setLoading(false));
	}, [limit, offset]);

	if (loading) return <div>Loading sessions...</div>;

	if (error) return <div className="text-red-500">{error}</div>;

	return (
		<div>
			<table className="min-w-full border text-sm">
				<thead>
					<tr className="bg-gray-100">
						<th className="border px-4 py-2">Session ID</th>
						<th className="border px-4 py-2">Count</th>
					</tr>
				</thead>
				<tbody>
					{sessions.length === 0 ? (
						<tr>
							<td
								colSpan={2}
								className="py-4 text-center"
							>
								No sessions found.
							</td>
						</tr>
					) : (
						sessions.map((session) => (
							<tr key={session.session_id}>
								<td className="border px-4 py-2 font-mono">{session.session_id}</td>
								<td className="border px-4 py-2">{session.count}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
			<div className="mt-2 text-xs text-gray-500">Total: {total}</div>
		</div>
	);
};

export default SessionTable;
