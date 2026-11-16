'use client';
import { Avatar, DropdownMenu } from 'radix-ui';
import type { ClientNavItem } from '@/data/navigation';
import styles from './nav-profile.module.css';

function getInitials(handle: string): string {
	const name = handle.split('.')[0];
	return name.slice(0, 2).toUpperCase();
}

export default function NavProfile({
	userDid,
	userHandle,
	userAvatarUrl = null,
	profileNavItems,
}: {
	userDid: string | null;
	userHandle: string | null;
	userAvatarUrl?: string | null;
	profileNavItems: ClientNavItem[];
}): React.ReactNode {
	if (!userDid) {
		const loginItem = profileNavItems.find(i => i.key === 'login');
		return loginItem ? (
			<a href={loginItem.href} className={styles.signInLink}>
				Sign in
			</a>
		) : null;
	}

	const initials = userHandle ? getInitials(userHandle) : '?';
	const menuItems = profileNavItems.filter(i => i.key !== 'login' && i.key !== 'logout');

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button type="button" className={styles.trigger} aria-label="Profile menu">
					<Avatar.Root className={styles.avatarRoot}>
						{userAvatarUrl && <Avatar.Image src={userAvatarUrl} alt={userHandle ?? 'User'} className={styles.avatarImage} />}
						<Avatar.Fallback className={styles.avatarFallback} delayMs={0}>
							{initials}
						</Avatar.Fallback>
					</Avatar.Root>
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.content} align="end" sideOffset={8}>
					{userHandle && (
						<>
							<div className={styles.handle}>@{userHandle}</div>
							<DropdownMenu.Separator className={styles.separator} />
						</>
					)}
					{menuItems.map(item => (
						<DropdownMenu.Item key={item.key} asChild>
							<a href={item.href} className={styles.item}>
								{item.label}
							</a>
						</DropdownMenu.Item>
					))}
					<DropdownMenu.Separator className={styles.separator} />
					<DropdownMenu.Item className={styles.item} onSelect={(e: Event): void => e.preventDefault()}>
						<form method="post" action="/api/oauth/logout" className={styles.signOutForm}>
							<button type="submit" className={styles.signOutButton}>
								Sign out
							</button>
						</form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
