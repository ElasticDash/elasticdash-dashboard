'use client';

import { useState } from 'react';
import { type MRT_RowSelectionState } from 'material-react-table';
import FusePageSimple from '@fuse/core/FusePageSimple';
import TestCasesHeader from '@/components/TestCasesHeader';
import TestCaseTable from '@/components/TestCaseTable';

export default function TestCasesPanel() {
	const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
	const [bulkRunTrigger, setBulkRunTrigger] = useState(0);
	const [bulkRunTimes, setBulkRunTimes] = useState<number>(5);

	return (
		<FusePageSimple
			header={
				<TestCasesHeader
					rowSelection={rowSelection}
					bulkRunTimes={bulkRunTimes}
					onBulkRunTimesChange={setBulkRunTimes}
					onBulkRunClick={() => setBulkRunTrigger((prev) => prev + 1)}
				/>
			}
			content={
				<div className="flex h-full min-h-0 w-full flex-col p-0">
					<TestCaseTable
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						bulkRunTrigger={bulkRunTrigger}
						bulkRunTimes={bulkRunTimes}
					/>
				</div>
			}
		/>
	);
}
