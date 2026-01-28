import PageBreadcrumb from 'src/components/PageBreadcrumb';
import SharedHeader from './SharedHeader';

/**
 * The TestCaseRunsHeader component.
 */
function TestCaseRunsHeader() {
	return (
		<div className="flex flex-auto flex-col border-b-2 px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<SharedHeader
					title="Test Case Runs"
					subtitle="View and monitor test case execution runs"
					icon="lucide:play-circle"
				/>
			</div>
		</div>
	);
}

export default TestCaseRunsHeader;
