import { Button, TextField } from '@mui/material';
import { type MRT_RowSelectionState } from 'material-react-table';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import SharedHeader from './SharedHeader';

interface TestCasesHeaderProps {
	rowSelection: MRT_RowSelectionState;
	bulkRunTimes: number;
	onBulkRunTimesChange: (times: number) => void;
	onBulkRunClick: () => void;
}

/**
 * The TestCasesHeader component.
 */
function TestCasesHeader({ rowSelection, bulkRunTimes, onBulkRunTimesChange, onBulkRunClick }: TestCasesHeaderProps) {
	const selectedCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

	return (
		<div className="flex flex-auto flex-col border-b-2 px-4 pt-4 sm:px-8">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<SharedHeader
					title="Test Cases"
					subtitle="View and manage test cases"
					icon="lucide:check-circle"
				/>
				<div className="ml-auto flex items-center gap-2">
					<TextField
						type="number"
						label="Number of Runs"
						value={bulkRunTimes}
						onChange={(e) => onBulkRunTimesChange(parseInt(e.target.value) || 1)}
						slotProps={{
							htmlInput: { min: 1, max: 100 }
						}}
						size="small"
						sx={{ width: 150 }}
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={onBulkRunClick}
						disabled={selectedCount === 0}
					>
						Bulk Run
						{selectedCount > 0 && ` (${selectedCount})`}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default TestCasesHeader;
