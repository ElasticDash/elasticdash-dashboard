import { redirect } from 'next/navigation';

function DashboardsPage() {
	redirect(`/sessions`);
	return null;
}

export default DashboardsPage;
