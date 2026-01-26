import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/sessions`);
	return null;
}

export default MainPage;
