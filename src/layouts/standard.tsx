import { StrictMode } from 'react';
import SiteHeader from '@/components/nav/site-header';
import type { AppContext } from '@/types';

export default function StandardLayout({
	children,
	ctx,
	siteSection,
}: {
	children: React.ReactNode;
	ctx: AppContext;
	siteSection: string;
}): React.ReactNode {
	return (
		<StrictMode>
			<SiteHeader ctx={ctx} siteSection={siteSection} />
			<main>{children}</main>
		</StrictMode>
	);
}
