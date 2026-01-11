'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import TicketsHeader from '../ui/TicketsHeader';
import TicketsTable from '../ui/TicketsTable';

/**
 * The TicketsView component.
 */
function TicketsView() {
	return (
		<FusePageSimple
			header={<TicketsHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<TicketsTable />
				</div>
			}
		/>
	);
}

export default TicketsView;
