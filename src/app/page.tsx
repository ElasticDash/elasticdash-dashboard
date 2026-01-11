import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/apps/chat`);
	return null;
}

export default MainPage;
