import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo, useState } from 'react';
import NavbarToggleButton from 'src/components/theme-layouts/components/navbar/NavbarToggleButton';
// import themeOptions from 'src/configs/themeOptions';
// import _ from 'lodash';
// import LightDarkModeToggle from 'src/components/LightDarkModeToggle';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
// import NotificationPanelToggleButton from '@/app/(control-panel)/apps/notifications/components/ui/notification-panel/NotificationPanelToggleButton';
// import AdjustFontSize from '../../components/AdjustFontSize';
// import FullScreenToggle from '../../components/FullScreenToggle';
// import LanguageSwitcher from '../../components/LanguageSwitcher';
// import NavigationShortcuts from '../../components/navigation/NavigationShortcuts';
// import NavigationSearch from '../../components/navigation/NavigationSearch';
// import QuickPanelToggleButton from '../../components/quickPanel/QuickPanelToggleButton';
import { Layout1ConfigDefaultsType } from '@/components/theme-layouts/layout1/Layout1Config';
import useThemeMediaQuery from '../../../../@fuse/hooks/useThemeMediaQuery';
import { AppBar, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ToolbarTheme from 'src/contexts/ToolbarTheme';
import Link from '@fuse/core/Link';

type ToolbarLayout1Props = {
	className?: string;
};

/**
 * The toolbar layout 1.
 */
function ToolbarLayout1(props: ToolbarLayout1Props) {
	const { className } = props;
	const settings = useFuseLayoutSettings();
	const config = settings.config as Layout1ConfigDefaultsType;
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [integrateDialogOpen, setIntegrateDialogOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const codeBlock = `<!-- Widget will be mounted in this div -->\n<div id="widget-container"></div>\n<script src="https://elasticdash-public-resources.s3.ap-southeast-2.amazonaws.com/index.global.js"></script>\n<script>\n  // Mount the widget\n  const widget = ElasticWidget.mount('#widget-container', {\n    // Configure your API endpoints here\n    apiEndpoint: '/api/chat',\n    apiBaseUrl: 'http://localhost:3000',\n    // token: 'your-token-here', // Uncomment and set your token if needed\n    onTokenRequired: () => {\n      alert('Please sign in to continue');\n      console.log('Token is required');\n    }\n  });\n\n  // You can unmount the widget later if needed:\n  // widget.unmount();\n</script>`;

	return (
		<ToolbarTheme>
			<AppBar
				id="fuse-toolbar"
				className={clsx('relative z-20 flex', className)}
				sx={(theme) => ({
					backgroundColor: theme.vars.palette.background.default,
					color: theme.vars.palette.text.primary
				})}
			>
				<Toolbar className="min-h-12 p-0 md:min-h-16">
					<div className="flex flex-1 items-center gap-3 px-2 md:px-4">
						{/* {config.navbar.display && config.navbar.position === 'left' && (
							<>
								<NavbarToggleButton />

								<Divider
									orientation="vertical"
									flexItem
									variant="middle"
								/>
							</>
						)}

						{!isMobile && <NavigationShortcuts />} */}
					</div>

					<div className="flex items-center gap-3 overflow-x-auto px-2 py-2 md:px-4">
						{/* <LanguageSwitcher />
						<AdjustFontSize />
						<FullScreenToggle />
						<LightDarkModeToggle
							lightTheme={_.find(themeOptions, { id: 'Default' })}
							darkTheme={_.find(themeOptions, { id: 'Default Dark' })}
						/>
						<NavigationSearch />
						<QuickPanelToggleButton />
						<NotificationPanelToggleButton /> */}
						<Link href="mailto:contact@elasticdash.com">
							<Button
								variant="contained"
								color="primary"
							>
								Human Support
							</Button>
						</Link>
						<Button
							variant="contained"
							color="primary"
							onClick={() => setIntegrateDialogOpen(true)}
						>
							Integrate To Your App
						</Button>
					</div>

					{config.navbar.display && config.navbar.position === 'right' && (
						<>
							{!isMobile && (
								<>
									<Divider
										orientation="vertical"
										flexItem
										variant="middle"
									/>
									<NavbarToggleButton />
								</>
							)}

							{isMobile && <NavbarToggleButton className="h-10 w-10 p-0 sm:mx-2" />}
						</>
					)}
				</Toolbar>
				<Dialog open={integrateDialogOpen} onClose={() => setIntegrateDialogOpen(false)} maxWidth="md" fullWidth>
					<DialogTitle>Integrate To Your App</DialogTitle>
					<DialogContent>
						<Paper variant="outlined" sx={{ background: '#18181b', color: '#fff', fontFamily: 'monospace', fontSize: 14, p: 2, position: 'relative' }}>
							<pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{codeBlock}</pre>
							<Button
								size="small"
								startIcon={<ContentCopyIcon sx={{ color: '#fff' }} />}
								sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', borderColor: '#fff' }}
								variant="outlined"
								onClick={() => {
									navigator.clipboard.writeText(codeBlock);
									setCopied(true);
									setTimeout(() => setCopied(false), 1500);
								}}
							>
								{copied ? 'Copied!' : 'Copy'}
							</Button>
						</Paper>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setIntegrateDialogOpen(false)} color="primary">
							Close
						</Button>
					</DialogActions>
				</Dialog>
			</AppBar>
		</ToolbarTheme>
	);
}

export default memo(ToolbarLayout1);
