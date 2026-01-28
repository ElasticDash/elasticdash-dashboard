import PageBreadcrumb from 'src/components/PageBreadcrumb';
import SharedHeader from './SharedHeader';

/**
 * The TestCaseRecordsHeader component.
 */
function TestCaseRecordsHeader() {
	return (
		<div className="flex flex-auto flex-col border-b-2 px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<SharedHeader
					title="Test Results"
					subtitle="View test case run records and their execution results"
					icon="lucide:clipboard-list"
				/>
			</div>
		</div>
	);
}

export default TestCaseRecordsHeader;
