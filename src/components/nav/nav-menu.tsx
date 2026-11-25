'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { NavigationMenu } from 'radix-ui';
import { topicUrl, VIEW_MODES } from '@/data/navigation';
import type { TopicDBRead } from '@/types';

export default function NavMenu({
	topics,
	currentTopic,
	siteSection,
	currentHostname,
}: {
	topics: TopicDBRead[];
	currentTopic: string | null;
	siteSection: string;
	currentHostname: string;
}): React.ReactNode {
	return (
		<NavigationMenu.Root className="nav-menu-root">
			<NavigationMenu.List className="nav-menu-list">
				<NavigationMenu.Item className="nav-menu-item">
					<NavigationMenu.Trigger className="nav-menu-trigger" data-active={siteSection === 'topics' || undefined}>
						Topics
						<ChevronDownIcon className="nav-menu-caret" aria-hidden />
					</NavigationMenu.Trigger>
					<NavigationMenu.Content className="nav-menu-content">
						<div className="nav-menu-topics-grid">
							{topics.map(topic => (
								<NavigationMenu.Link
									key={topic.subdomain}
									href={topicUrl(topic.subdomain, currentHostname)}
									className="nav-menu-topic-card"
									data-active={topic.subdomain === currentTopic || undefined}
								>
									<span className="nav-menu-topic-card-title">{topic.title}</span>
								</NavigationMenu.Link>
							))}
						</div>
					</NavigationMenu.Content>
				</NavigationMenu.Item>

				<NavigationMenu.Item className="nav-menu-item">
					<NavigationMenu.Trigger className="nav-menu-trigger" data-active={siteSection === 'builders' || undefined}>
						Builders
						<ChevronDownIcon className="nav-menu-caret" aria-hidden />
					</NavigationMenu.Trigger>
					<NavigationMenu.Content className="nav-menu-content">
						<ul className="nav-menu-dropdown-list">
							{VIEW_MODES.map(view => (
								<li key={view.key}>
									<NavigationMenu.Link href={`/builders/${view.key}`} className="nav-menu-dropdown-link">
										{view.label}
									</NavigationMenu.Link>
								</li>
							))}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>

				<NavigationMenu.Item>
					<NavigationMenu.Link href="/about" className="nav-menu-link" data-active={siteSection === 'about' || undefined}>
						About
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	);
}
