'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import TestCaseRunsHeader from '@/components/TestCaseRunsHeader';
import TestCaseRunTable from '@/components/TestCaseRunTable';

export default function TestCaseRunsPage() {
	return (
		<FusePageSimple
			header={<TestCaseRunsHeader />}
			content={
				<div className="w-full">
					<TestCaseRunTable />
				</div>
			}
		/>
	);
}
