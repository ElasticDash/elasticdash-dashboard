import { redirect } from 'next/navigation';

function DashboardsPage() {
	redirect(`/test-results`);
	return null;
}

export default DashboardsPage;
