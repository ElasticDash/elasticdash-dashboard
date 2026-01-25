'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import SessionsHeader from '@/components/SessionsHeader';
import SessionTable from '@/components/SessionTable';

const SessionsPage = () => {
	return (
		<FusePageSimple
			header={<SessionsHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<SessionTable />
				</div>
			}
		/>
	);
};

export default SessionsPage;
