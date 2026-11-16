import { getNavItems } from '@/data/navigation';
import { getTopics } from '@/repositories';
import type { AppContext } from '@/types';
import NavMenu from './nav-menu';
import NavProfile from './nav-profile';
import stylesUrl from './site-header.less?url';

export default async function SiteHeader({
	ctx,
	userHandle = null,
	userAvatarUrl = null,
}: {
	ctx: AppContext;
	userHandle?: string | null;
	userAvatarUrl?: string | null;
}): Promise<React.ReactNode> {
	const profileNavItems = getNavItems('profile', ctx.permissions).map(({ icon: _, ...item }) => item);
	const topics = await getTopics(ctx.logger);

	return (
		<>
			<link rel="stylesheet" href={stylesUrl} precedence="component" />
			<header className="site-header">
				<a href="/" className="logo">
					Stance Build
				</a>
				{ctx.topic && <span className="topic-name">{ctx.topic.title}</span>}
				<div className="header-controls">
					<NavMenu topics={topics} currentTopic={ctx.topic?.subdomain ?? null} />
				</div>
				<div className="profile-wrapper">
					<NavProfile
						userDid={ctx.session?.did ?? null}
						userHandle={userHandle}
						userAvatarUrl={userAvatarUrl}
						profileNavItems={profileNavItems}
					/>
				</div>
			</header>
		</>
	);
}
