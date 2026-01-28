import SharedHeader from '@/components/SharedHeader';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

/**
 * The TicketsHeader component.
 */
function TicketsHeader() {
	return (
		<div className="flex flex-auto flex-col border-b-2 px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<SharedHeader
					title={'Tickets'}
					subtitle={'View and manage support tickets'}
					icon={'lucide:ticket'}
				/>
			</div>
		</div>
	);
}

export default TicketsHeader;
