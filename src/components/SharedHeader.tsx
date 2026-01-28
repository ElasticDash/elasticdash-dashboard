import Typography from '@mui/material/Typography';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * The SessionsHeader component.
 */
function SessionsHeader({ title, subtitle, icon }) {
	return (
		<div className="flex flex-auto items-center gap-2 pb-4">
			<div className="flex min-w-0 flex-col">
				<Typography className="truncate text-xl leading-7 font-semibold tracking-tight md:text-3xl md:leading-[1.375]">
					{title}
				</Typography>
				<div className="flex items-center gap-1">
					{/* <FuseSvgIcon color="action">{icon}</FuseSvgIcon> */}
					<Typography
						className="text-md truncate"
						color="text.secondary"
					>
						{subtitle}
					</Typography>
				</div>
			</div>
		</div>
	);
}

export default SessionsHeader;
