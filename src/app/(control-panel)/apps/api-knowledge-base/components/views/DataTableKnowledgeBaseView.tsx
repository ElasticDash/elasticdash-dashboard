'use client';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useState } from 'react';
import * as React from 'react';
import { Tabs, Tab } from '@mui/material';
import KnowledgeBaseTable from '../ui/tabs/KnowledgeBaseTable';
import ApiKnowledgeBaseHeader from '../ui/ApiKnowledgeBaseHeader';

/**
 * The ApiKnowledgeBaseView component.
 */

function ApiKnowledgeBaseView() {
	const [tabValue, setTabValue] = useState('live');
	const [tableRefreshKey, setTableRefreshKey] = useState(0);

	function handleTabChange(event: React.SyntheticEvent, value: string) {
		setTabValue(value);
	}

	const handleApiCreated = () => {
		setTableRefreshKey((k) => k + 1);
	};

	return (
		<FusePageSimple
			header={
				<ApiKnowledgeBaseHeader
					isChangesTab={tabValue === 'changes'}
					onApiCreated={handleApiCreated}
				/>
			}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<div className="mb-4 flex w-full flex-col justify-between gap-2 px-4 sm:flex-row sm:items-center md:px-8">
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
					{tabValue === 'live' && (
						<KnowledgeBaseTable
							live={true}
							key={`live-${tableRefreshKey}`}
						/>
					)}
					{tabValue === 'changes' && (
						<KnowledgeBaseTable
							live={false}
							key={`changes-${tableRefreshKey}`}
						/>
					)}
				</div>
			}
		/>
	);
}

export default ApiKnowledgeBaseView;
