import { JSX } from 'react';
import loadable from '@loadable/component';
const ReactJson = loadable(() => import('react-json-view'));

/**
 * Helper function to prettify JSON content for display in UI.
 * Returns a JSX element with formatted JSON or string.
 */
export function prettifyJSON(content: any): string | JSX.Element {
	if (content === null || content === undefined) {
		return '';
	}

	// If it's already a string, try to parse and re-stringify it
	if (typeof content === 'string') {
		if (!content.trim().startsWith('{') && !content.trim().startsWith('[')) {
			try {
				return (
					<pre
						style={{
							background: '#f5f5f5',
							padding: '16px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
							marginBottom: '24px'
						}}
					>
						{String(content)}
					</pre>
				);
			} catch (err) {
				return (
					<pre
						style={{
							background: '#f5f5f5',
							padding: '16px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
							marginBottom: '24px'
						}}
					>
						{String(content)}
					</pre>
				);
			}
		} else {
			try {
				const parsed = JSON.parse(content);
				return (
					<pre
						style={{
							background: '#f5f5f5',
							padding: '16px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
							marginBottom: '24px'
						}}
					>
						<ReactJson
							src={parsed}
							name={null}
							enableClipboard={false}
							displayDataTypes={false}
							indentWidth={2}
							style={{ fontSize: '14px' }}
						/>
					</pre>
				);
			} catch (err) {
				// If parsing fails, return the original string
				return (
					<pre
						style={{
							background: '#f5f5f5',
							padding: '16px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '14px',
							marginBottom: '24px'
						}}
					>
						{content}
					</pre>
				);
			}
		}
	}

	// If it's an object, stringify it with formatting
	try {
		return (
			<pre
				style={{
					background: '#f5f5f5',
					padding: '16px',
					borderRadius: '4px',
					overflow: 'auto',
					fontSize: '14px',
					marginBottom: '24px'
				}}
			>
				{content instanceof Object ? JSON.stringify(content, null, 2) : String(content)}
			</pre>
		);
	} catch (err) {
		return (
			<pre
				style={{
					background: '#f5f5f5',
					padding: '16px',
					borderRadius: '4px',
					overflow: 'auto',
					fontSize: '14px',
					marginBottom: '24px'
				}}
			>
				{content instanceof Object ? JSON.stringify(content, null, 2) : String(content)}
			</pre>
		);
	}
}
