import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

/**
 * The DocumentsTab component.
 */
function DocumentsTab() {
	const documents = [
		{ id: 1, title: 'User Data Schema', date: '2026-01-10' },
		{ id: 2, title: 'Product Catalog', date: '2026-01-09' },
		{ id: 3, title: 'Order History', date: '2026-01-08' },
		{ id: 4, title: 'Customer Analytics', date: '2026-01-07' }
	];

	return (
		<div className="flex flex-col gap-8 p-4 sm:p-8">
			<Paper className="flex flex-col gap-6 p-8 shadow">
				<div className="flex items-center gap-2">
					<FuseSvgIcon className="text-48">lucide:file-text</FuseSvgIcon>
					<Typography className="text-3xl font-bold tracking-tight">
						Documents
					</Typography>
				</div>

				<Typography
					className="text-lg"
					color="text.secondary"
				>
					Browse and manage your data table documentation and schemas.
				</Typography>

				<List className="w-full">
					{documents.map((doc) => (
						<ListItem
							key={doc.id}
							className="rounded-lg hover:bg-hover"
						>
							<ListItemIcon>
								<FuseSvgIcon>lucide:file</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText
								primary={doc.title}
								secondary={`Last modified: ${doc.date}`}
							/>
						</ListItem>
					))}
				</List>
			</Paper>
		</div>
	);
}

export default DocumentsTab;
