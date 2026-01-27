'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import FusePageSimple from '@fuse/core/FusePageSimple';
import TestCasesHeader from '@/components/TestCasesHeader';
import TestCaseTable from '@/components/TestCaseTable';

export default function TestCasesPanel() {
	const [features, setFeatures] = useState<{ id: number; featureName: string }[]>([]);
	const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
	const [featuresLoading, setFeaturesLoading] = useState(false);
	const [featuresError, setFeaturesError] = useState<string | null>(null);

	const test_project_id = 1;

	useEffect(() => {
		const fetchFeatures = async () => {
			setFeaturesLoading(true);
			setFeaturesError(null);
			try {
				const res = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/features/list', {
					params: { test_project_id },
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token') || ''}`
					}
				});
				setFeatures(res.data?.result || []);
			} catch (err: any) {
				setFeaturesError(err?.message || 'Failed to fetch features');
			} finally {
				setFeaturesLoading(false);
			}
		};
		fetchFeatures();
	}, [test_project_id]);

	return (
		<FusePageSimple
			header={<TestCasesHeader />}
			leftSidebarProps={{
				open: true,
				width: 240,
				content: (
					<div
						style={{
							width: '100%',
							height: '100%',
							padding: 16,
							background: '#fafafa'
						}}
					>
						<h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>Features</h3>
						{featuresLoading ? (
							<div>Loading...</div>
						) : featuresError ? (
							<div style={{ color: 'red' }}>{featuresError}</div>
						) : (
							<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
								{features.map((feature) => (
									<li
										key={feature.id}
										style={{ marginBottom: 4 }}
									>
										<button
											style={{
												width: '100%',
												textAlign: 'left',
												padding: '10px 12px',
												background: selectedFeatureId === feature.id ? '#e0e7ff' : 'transparent',
												border: 'none',
												borderRadius: 6,
												cursor: 'pointer',
												fontWeight: selectedFeatureId === feature.id ? 600 : 400,
												transition: 'all 0.2s ease'
											}}
											onMouseEnter={(e) => {
												if (selectedFeatureId !== feature.id) {
													e.currentTarget.style.background = '#f5f5f5';
												}
											}}
											onMouseLeave={(e) => {
												if (selectedFeatureId !== feature.id) {
													e.currentTarget.style.background = 'transparent';
												}
											}}
											onClick={() => setSelectedFeatureId(feature.id)}
										>
											{feature.featureName}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				)
			}}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<TestCaseTable selectedFeatureId={selectedFeatureId} />
				</div>
			}
		/>
	);
}
