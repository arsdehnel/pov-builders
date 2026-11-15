'use client';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from 'radix-ui';
import type { DSLink as DSLinkType, Permission } from '@/types';
import DSLink from '../link/ds-link';
import styleClasses from './ds-pop-menu.module.css';

export default function DSPopMenu({
	items,
	userPermissions,
}: {
	items: DSLinkType[];
	userPermissions: Permission[];
}): React.ReactNode {
	const permittedItems = items.filter(i => {
		if (i.requiredPermission && !userPermissions?.includes(i.requiredPermission)) {
			return false;
		}
		return true;
	});

	if (permittedItems.length === 0) {
		return null;
	}

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger className={styleClasses.rzPopMenu} asChild>
				<button type="button" aria-label="Menu Label">
					<HamburgerMenuIcon />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content>
					{permittedItems.map(i => {
						const { key, ...rest } = i;
						return (
							<DropdownMenu.Item key={i.href} asChild>
								<DSLink userPermissions={userPermissions} {...rest} />
							</DropdownMenu.Item>
						);
					})}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
