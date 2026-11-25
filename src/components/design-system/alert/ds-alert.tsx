import styles from './ds-alert.module.css';

type AlertVariant = 'error' | 'warning' | 'info';

export default function DSAlert({
	children,
	variant = 'error',
}: {
	children: React.ReactNode;
	variant?: AlertVariant;
}): React.ReactNode {
	return (
		<div className={styles['ds-alert']} data-variant={variant} role="alert">
			{children}
		</div>
	);
}
