'use client';
import classnames from 'classnames';
import type { DSLink as DSLinkType, Permission } from '@/types';
import DSLink from '../link/ds-link';
import styleClasses from './ds-card.module.css';

export default function DSCard({
	title,
	body,
	children,
	actions,
	userPermissions,
	className,
}: {
	title: string;
	body?: string | React.ReactNode;
	children?: React.ReactNode;
	actions?: DSLinkType[];
	userPermissions: Permission[];
	className?: string;
}): React.ReactNode {
	const bodyContent = body ?? children;
	return (
		<div className={classnames(styleClasses.dsCard, className)}>
			<div className={classnames(styleClasses.dsCardTitle, 'ds-card-title')}>{title}</div>
			{bodyContent && <div className={styleClasses.dsCardBody}>{bodyContent}</div>}
			{actions && (
				<div className={styleClasses.dsCardActions}>
					{actions.map(a => {
						return <DSLink key={a.href} userPermissions={userPermissions} {...a} />;
					})}
				</div>
			)}
		</div>
	);
}
