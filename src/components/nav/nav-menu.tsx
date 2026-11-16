'use client';
import { NavigationMenu } from 'radix-ui';
import { VIEW_MODES } from '@/data/navigation';
import type { TopicDBRead } from '@/types';
import styles from './nav-menu.module.css';

export default function NavMenu({
	topics,
	currentTopic,
}: {
	topics: TopicDBRead[];
	currentTopic: string | null;
}): React.ReactNode {
	return (
		<NavigationMenu.Root className={styles.root}>
			<NavigationMenu.List className={styles.list}>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger className={styles.trigger}>Topics</NavigationMenu.Trigger>
					<NavigationMenu.Content className={styles.content}>
						<ul className={styles.dropdownList}>
							{topics.map(topic => (
								<li key={topic.subdomain}>
									<NavigationMenu.Link
										href={`/${topic.subdomain}`}
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
					<NavigationMenu.Trigger className={styles.trigger}>Views</NavigationMenu.Trigger>
					<NavigationMenu.Content className={styles.content}>
						<ul className={styles.dropdownList}>
							{VIEW_MODES.map(view => (
								<li key={view.key}>
									<NavigationMenu.Link href={`/${currentTopic ?? 'ai'}/${view.key}`} className={styles.dropdownLink}>
										{view.label}
									</NavigationMenu.Link>
								</li>
							))}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>

				<NavigationMenu.Item>
					<NavigationMenu.Link href="/about" className={styles.navLink}>
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
