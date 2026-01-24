'use client';

import React, { useEffect, useState } from 'react';
import { fetchSessions, SessionListItem } from '@/services/sessionService';
import { fetchSessionDetail } from '@/services/sessionDetailService';
import SessionDetailDialog from './SessionDetailDialog';

interface SessionTableProps {
	limit?: number;
	offset?: number;
}




const SessionTable: React.FC<SessionTableProps> = ({ limit = 10, offset = 0 }) => {
	const [sessions, setSessions] = useState<SessionListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
	const [detail, setDetail] = useState<any | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);

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

	const handleOpenDialog = async (sessionId: string) => {
		setSelectedSessionId(sessionId);
		setDialogOpen(true);
		setDetail(null);
		setDetailError(null);
		setDetailLoading(true);
		try {
			const res = await fetchSessionDetail({ sessionId });
			setDetail(res);
		} catch (err: any) {
			setDetailError(err.message || 'Failed to fetch session detail');
		} finally {
			setDetailLoading(false);
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setSelectedSessionId(null);
		setDetail(null);
		setDetailError(null);
		setDetailLoading(false);
	};

	if (loading) return <div>Loading sessions...</div>;
	if (error) return <div className="text-red-500">{error}</div>;

	return (
		<div>
			<table className="min-w-full border text-sm">
				<thead>
					<tr className="bg-gray-100">
						<th className="border px-4 py-2">Session ID</th>
						<th className="border px-4 py-2">Count</th>
						<th className="border px-4 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{sessions.length === 0 ? (
						<tr>
							<td colSpan={3} className="py-4 text-center">No sessions found.</td>
						</tr>
					) : (
						sessions.map((session) => (
							<tr key={session.session_id}>
								<td className="border px-4 py-2 font-mono">{session.session_id}</td>
								<td className="border px-4 py-2">{session.count}</td>
								<td className="border px-4 py-2">
									<button
										className="text-blue-600 hover:underline px-2 py-1"
										onClick={() => handleOpenDialog(session.session_id)}
									>
										View Detail
									</button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
			<div className="mt-2 text-xs text-gray-500">Total: {total}</div>
			<SessionDetailDialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				sessionId={selectedSessionId}
				detail={detail}
				loading={detailLoading}
				error={detailError}
			/>
		</div>
	);
};

export default SessionTable;
