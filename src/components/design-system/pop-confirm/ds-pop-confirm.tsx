'use client';
import { AlertDialog } from 'radix-ui';
import styleClasses from './ds-pop-confirm.module.css';

export default function DSPopConfirm({
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	children,
}: {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void | Promise<void>;
	children: React.ReactNode;
}): React.ReactNode {
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className={styleClasses.overlay} />
				<AlertDialog.Content className={styleClasses.content}>
					<AlertDialog.Title className={styleClasses.title}>{title}</AlertDialog.Title>
					{description && <AlertDialog.Description className={styleClasses.description}>{description}</AlertDialog.Description>}
					<div className={styleClasses.actions}>
						<AlertDialog.Cancel asChild>
							<button type="button" className={styleClasses.cancel}>
								{cancelLabel}
							</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild onClick={onConfirm}>
							<button type="button" className={styleClasses.confirm}>
								{confirmLabel}
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
