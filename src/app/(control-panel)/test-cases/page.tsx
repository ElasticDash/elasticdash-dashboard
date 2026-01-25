'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import TestCasesHeader from '@/components/TestCasesHeader';
import TestCaseTable from '@/components/TestCaseTable';

export default function TestCasesPanel() {
	return (
		<FusePageSimple
			header={<TestCasesHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<TestCaseTable />
				</div>
			}
		/>
	);
}
