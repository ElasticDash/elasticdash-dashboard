import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

/**
 * The SessionsHeader component.
 */
function SessionsHeader() {
	return (
		<div className="flex flex-auto flex-col px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<div className="flex min-w-0 flex-col">
						<Typography className="truncate text-xl leading-7 font-semibold tracking-tight md:text-3xl md:leading-[1.375]">
							Sessions
						</Typography>
						<div className="flex items-center gap-1">
							<FuseSvgIcon color="action">lucide:list</FuseSvgIcon>
							<Typography
								className="text-md truncate"
								color="text.secondary"
							>
								View and manage user sessions
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SessionsHeader;
