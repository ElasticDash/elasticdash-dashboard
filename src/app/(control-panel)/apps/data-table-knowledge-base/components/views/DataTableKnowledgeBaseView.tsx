'use client';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useState } from 'react';
import * as React from 'react';
import { Tabs, Tab } from '@mui/material';
import DataTableKnowledgeBaseHeader from '../ui/DataTableKnowledgeBaseHeader';
import KnowledgeBaseTable from '../ui/tabs/KnowledgeBaseTable';

/**
 * The DataTableKnowledgeBaseView component.
 */
function DataTableKnowledgeBaseView() {
	const [tabValue, setTabValue] = useState('live');

	function handleTabChange(event: React.SyntheticEvent, value: string) {
		setTabValue(value);
	}

	return (
		   <FusePageSimple
			   header={<DataTableKnowledgeBaseHeader isChangesTab={tabValue === 'changes'} />}
			   content={
				<div className="w-full pt-4 sm:pt-6">
					<div className="flex w-full flex-col justify-between gap-2 px-4 mb-4 sm:flex-row sm:items-center md:px-8">
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							aria-label="Data table knowledge base tabs"
						>
							<Tab
								value="live"
								label="Live"
							/>
							<Tab
								value="changes"
								label="Changes"
							/>
						</Tabs>
					</div>
					{tabValue === 'live' && <KnowledgeBaseTable />}
					{tabValue === 'changes' && <KnowledgeBaseTable />}
				</div>
			}
		/>
	);
}

export default DataTableKnowledgeBaseView;
