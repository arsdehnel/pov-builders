import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';

export default function NotFound({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<StandardLayout siteSection="" ctx={ctx}>
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<h1>404 — Page not found</h1>
				<p>The page you were looking for doesn&apos;t exist.</p>
				<a href="/">Go home</a>
			</div>
		</StandardLayout>
	);
}
