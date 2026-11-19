'use client';
import { NavigationMenu } from 'radix-ui';
import { VIEW_MODES } from '@/data/navigation';
import type { TopicDBRead } from '@/types';
import styles from './nav-menu.module.css';

function devTopicUrl(topicSubdomain: string, _currentHostname: string): string {
	return `/dev/topic/${topicSubdomain}`;
}

// topic.env.real-domain.com
// env.real-domain.com
// topic.real-domain.com
// real-domain.com
function cfTopicUrl(topicSubdomain: string, currentHostname: string): string {
	const cfDomain = 'stance.build';
	const envs = ['integration', 'staging'];
	const [firstPortion, ...rest] = currentHostname.split('.');
	if (envs.includes(firstPortion) || firstPortion === cfDomain) {
		return `${topicSubdomain}.${currentHostname}`;
	}
	return `${topicSubdomain}.${rest.join('.')}`;
}

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
	const topicUrlGenerator = import.meta.env.DEV ? devTopicUrl : cfTopicUrl;
	return (
		<NavigationMenu.Root className={styles.root}>
			<NavigationMenu.List className={styles.list}>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger className={styles.trigger} data-active={siteSection === 'topics' || undefined}>
						Topics
					</NavigationMenu.Trigger>
					<NavigationMenu.Content className={styles.content}>
						<ul className={styles.dropdownList}>
							{topics.map(topic => (
								<li key={topic.subdomain}>
									<NavigationMenu.Link
										href={topicUrlGenerator(topic.subdomain, currentHostname)}
										className={styles.dropdownLink}
										data-active={topic.subdomain === currentTopic || undefined}
									>
										{topic.title}
									</NavigationMenu.Link>
								</li>
							))}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>

				<NavigationMenu.Item>
					<NavigationMenu.Trigger className={styles.trigger} data-active={siteSection === 'views' || undefined}>
						Views
					</NavigationMenu.Trigger>
					<NavigationMenu.Content className={styles.content}>
						<ul className={styles.dropdownList}>
							{VIEW_MODES.map(view => (
								<li key={view.key}>
									<NavigationMenu.Link href={`/views/${view.key}`} className={styles.dropdownLink}>
										{view.label}
									</NavigationMenu.Link>
								</li>
							))}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>

				<NavigationMenu.Item>
					<NavigationMenu.Link href="/about" className={styles.navLink} data-active={siteSection === 'about' || undefined}>
						About
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>

			<div className={styles.viewportPosition}>
				<NavigationMenu.Viewport className={styles.viewport} />
			</div>
		</NavigationMenu.Root>
	);
}
