'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import TestCaseRecordsHeader from '@/components/TestCaseRecordsHeader';
import TestCaseRecordTable from '@/components/TestCaseRecordTable';

export default function TestCaseRecordsPage() {
	return (
		<FusePageSimple
			header={<TestCaseRecordsHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<TestCaseRecordTable />
				</div>
			}
		/>
	);
}
