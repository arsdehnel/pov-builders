'use client';
import classnames from 'classnames';
import type { DSLink as DSLinkType, Permission } from '@/types';
import DSLink from '../link/ds-link';
import styleClasses from './ds-card.module.css';

export default function DSCard({
	title,
	body,
	children,
	band,
	actions,
	alignment = 'horizontal',
	userPermissions,
	className,
	style,
}: {
	title: string;
	body?: string | React.ReactNode;
	children?: React.ReactNode;
	band?: React.ReactNode;
	actions?: DSLinkType[];
	alignment?: 'horizontal' | 'vertical';
	userPermissions: Permission[];
	className?: string;
	style?: React.CSSProperties;
}): React.ReactNode {
	const bodyContent = body ?? children;
	return (
		<div
			className={classnames(styleClasses.dsCard, 'ds-card', alignment === 'vertical' && styleClasses.dsCardVertical, className)}
			style={style}
		>
			<div className={classnames(styleClasses.dsCardTitle, 'ds-card-title')}>{title}</div>
			{(bodyContent || band) && (
				<div className={classnames(styleClasses.dsCardBody, 'ds-card-body')}>
					{bodyContent}
					{band && <div className={classnames(styleClasses.dsCardBand, 'ds-card-band')}>{band}</div>}
				</div>
			)}
			{actions && (
				<div className={classnames(styleClasses.dsCardActions, 'ds-card-actions')}>
					{actions.map(a => {
						return <DSLink key={a.href} userPermissions={userPermissions} {...a} />;
					})}
				</div>
			)}
		</div>
	);
}
