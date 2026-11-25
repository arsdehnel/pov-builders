import type { RequestInfo } from 'rwsdk/worker';
import DSCard from '@/components/design-system/card/ds-card';
import { topicUrl } from '@/data/navigation';
import StandardLayout from '@/layouts/standard';
import { d1 } from '@/repositories';
import homeStylesUrl from './home.less?url';

export default async function Pages__root({ ctx, request }: RequestInfo): Promise<React.JSX.Element> {
	const topics = await d1.getTopics(ctx.logger);
	const hostname = new URL(request.url).hostname;

	return (
		<StandardLayout siteSection="home" ctx={ctx}>
			<link rel="stylesheet" href={homeStylesUrl} precedence="page" />
			<div className="home-hero">
				<div className="home-hero-inner">
					<h1>Build your POV</h1>
					<p>
						Build your POV on the topics that matter. Share it verifiably with the world via AT Protocol, with full control over
						your own data.
					</p>
				</div>
			</div>
			<div className="home-content">
				<h2 className="home-section-heading">Topics</h2>
				<div className="home-topics-grid">
					{topics.map(topic => (
						<a key={topic.id} href={topicUrl(topic.subdomain, hostname)} className="home-topic-link">
							<DSCard title={topic.title} alignment="vertical" userPermissions={[]}>
								<div className="home-topic-card-body" />
							</DSCard>
						</a>
					))}
				</div>
			</div>
		</StandardLayout>
	);
}
