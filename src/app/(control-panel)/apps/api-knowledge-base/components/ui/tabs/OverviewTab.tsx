import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * The OverviewTab component.
 */
function OverviewTab() {
	return (
		<div className="flex flex-col gap-8 p-4 sm:p-8">
			<Paper className="flex flex-col gap-6 p-8 shadow">
				<div className="flex items-center gap-2">
					<FuseSvgIcon className="text-48">lucide:bar-chart-3</FuseSvgIcon>
					<Typography className="text-3xl font-bold tracking-tight">Overview</Typography>
				</div>

				<Typography
					className="text-lg"
					color="text.secondary"
				>
					Welcome to the API Knowledge Base. This is the overview tab where you can view summary statistics
					and key metrics about your API knowledge base.
				</Typography>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Paper className="flex flex-col gap-2 p-6 shadow-sm">
						<Typography
							className="text-sm font-medium"
							color="text.secondary"
						>
							Total Tables
						</Typography>
						<Typography className="text-4xl font-bold">24</Typography>
					</Paper>

					<Paper className="flex flex-col gap-2 p-6 shadow-sm">
						<Typography
							className="text-sm font-medium"
							color="text.secondary"
						>
							Total Records
						</Typography>
						<Typography className="text-4xl font-bold">15,847</Typography>
					</Paper>

					<Paper className="flex flex-col gap-2 p-6 shadow-sm">
						<Typography
							className="text-sm font-medium"
							color="text.secondary"
						>
							Last Updated
						</Typography>
						<Typography className="text-4xl font-bold">Today</Typography>
					</Paper>
				</div>
			</Paper>
		</div>
	);
}

export default OverviewTab;
