import { redirect } from 'next/navigation';

function DashboardsPage() {
	redirect(`/apps/chat`);
	return null;
}

export default DashboardsPage;
