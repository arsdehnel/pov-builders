import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';

export default function Pages__about({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<StandardLayout siteSection="about" ctx={ctx}>
			<section className="section">
				<h2 className="sectionTitle">About POV Builders</h2>
				<p className="prose">Placeholder content — coming soon.</p>
			</section>
		</StandardLayout>
	);
}
