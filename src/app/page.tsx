import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/test-results`);
	return null;
}

export default MainPage;
