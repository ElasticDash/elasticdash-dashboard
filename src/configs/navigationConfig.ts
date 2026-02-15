import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
// import SettingsAppNavigation from '../app/(control-panel)/apps/settings/lib/constants/SettingsAppNavigation';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tr', 'navigation', tr);
i18n.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'apps.test-results',
		title: 'Test Results',
		type: 'item',
		icon: 'lucide:chart-bar', // Results: bar chart
		url: '/test-results'
	},
	{
		id: 'apps.test-cases',
		title: 'Test Cases',
		type: 'item',
		icon: 'lucide:list-checks', // Cases: checklist
		url: '/test-cases'
	},
	{
		id: 'apps.traces',
		title: 'Traces',
		type: 'item',
		icon: 'lucide:git-branch', // Traces: branch/trace
		url: '/traces'
	},
	{
		id: 'apps.account-settings',
		title: 'Account Settings',
		type: 'item',
		icon: 'lucide:settings',
		url: '/apps/account-settings'
	}
	// {
	// 	id: 'apps',
	// 	title: 'Applications',
	// 	subtitle: 'Custom made application designs',
	// 	type: 'group',
	// 	icon: 'lucide:box',
	// 	translate: 'APPLICATIONS',
	// 	children: [
	// 		{
	// 			id: 'apps.test-results',
	// 			title: 'Test Results',
	// 			type: 'item',
	// 			icon: 'lucide:chart-bar', // Results: bar chart
	// 			url: '/test-results'
	// 		},
	// 		{
	// 			id: 'apps.test-cases',
	// 			title: 'Test Cases',
	// 			type: 'item',
	// 			icon: 'lucide:list-checks', // Cases: checklist
	// 			url: '/test-cases'
	// 		},
	// 		{
	// 			id: 'apps.traces',
	// 			title: 'Traces',
	// 			type: 'item',
	// 			icon: 'lucide:git-branch', // Traces: branch/trace
	// 			url: '/traces'
	// 		},
	// 		{
	// 			id: 'apps.account-settings',
	// 			title: 'Account Settings',
	// 			type: 'item',
	// 			icon: 'lucide:settings',
	// 			url: '/apps/account-settings'
	// 		}
	// 	]
	// }
];

export default navigationConfig;
