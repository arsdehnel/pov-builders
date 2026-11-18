import { StrictMode } from 'react';
import SiteHeader from '@/components/nav/site-header';
import type { AppContext } from '@/types';

export default function StandardLayout({
	children,
	pageTitle,
	ctx,
	userHandle = null,
	userAvatarUrl = null,
	siteSection,
}: {
	children: React.ReactNode;
	pageTitle: string;
	ctx: AppContext;
	userHandle?: string | null;
	userAvatarUrl?: string | null;
	siteSection: string;
}): React.ReactNode {
	return (
		<StrictMode>
			<SiteHeader ctx={ctx} userHandle={userHandle} userAvatarUrl={userAvatarUrl} siteSection={siteSection} />
			<main>{children}</main>
		</StrictMode>
	);
}
