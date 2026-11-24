import { requestInfo } from 'rwsdk/worker';
import { getNavItems } from '@/data/navigation';
import { d1 } from '@/repositories';
import type { AppContext } from '@/types';
import NavMenu from './nav-menu';
import navMenuStylesUrl from './nav-menu.less?url';
import NavProfile from './nav-profile';
import stylesUrl from './site-header.less?url';

export default async function SiteHeader({
	ctx,
	userHandle = null,
	userAvatarUrl = null,
	siteSection,
}: {
	ctx: AppContext;
	userHandle?: string | null;
	userAvatarUrl?: string | null;
	siteSection: string;
}): Promise<React.ReactNode> {
	const { request } = requestInfo;
	const currentHostname = new URL(request.url).hostname;
	const profileNavItems = getNavItems('profile', ctx.permissions).map(({ icon: _, ...item }) => item);
	const topics = await d1.getTopics(ctx.logger);

	return (
		<>
			<link rel="stylesheet" href={stylesUrl} precedence="component" />
			<link rel="stylesheet" href={navMenuStylesUrl} precedence="component" />
			<header className="site-header">
				<a href="/" className="logo">
					Stance Build
				</a>
				{ctx.topic && <span className="topic-name">{ctx.topic.title}</span>}
				<div className="header-controls">
					<NavMenu
						topics={topics}
						currentTopic={ctx.topic?.subdomain ?? null}
						siteSection={siteSection}
						currentHostname={currentHostname}
					/>
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
