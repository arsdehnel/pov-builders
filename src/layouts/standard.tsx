import { StrictMode } from 'react';
import SiteHeader from '@/components/nav/site-header';
import type { AppContext } from '@/types';

export default function StandardLayout({
	children,
	pageTitle,
	ctx,
	userHandle = null,
	userAvatarUrl = null,
	currentBasePage: _currentBasePage,
	leftNav: _leftNav,
}: {
	children: React.ReactNode;
	pageTitle: string;
	ctx: AppContext;
	userHandle?: string | null;
	userAvatarUrl?: string | null;
	/** @deprecated kept for call-site compatibility while pages migrate */
	currentBasePage?: string;
	/** @deprecated kept for call-site compatibility while pages migrate */
	leftNav?: string;
}): React.ReactNode {
	return (
		<StrictMode>
			<SiteHeader ctx={ctx} userHandle={userHandle} userAvatarUrl={userAvatarUrl} />
			<main>
				<h2 className="page-title">{pageTitle}</h2>
				<div className="app-layout-content">{children}</div>
			</main>
		</StrictMode>
	);
}
