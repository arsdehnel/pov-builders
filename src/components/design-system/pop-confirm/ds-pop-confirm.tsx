'use client';
import { Dialog } from 'radix-ui';
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
		<Dialog.Root>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className={styleClasses.overlay} />
				<Dialog.Content className={styleClasses.content}>
					<Dialog.Title className={styleClasses.title}>{title}</Dialog.Title>
					{description && <Dialog.Description className={styleClasses.description}>{description}</Dialog.Description>}
					<div className={styleClasses.actions}>
						<Dialog.Close asChild>
							<button type="button" className={styleClasses.cancel}>
								{cancelLabel}
							</button>
						</Dialog.Close>
						<Dialog.Close asChild>
							<button type="button" className={styleClasses.confirm} onClick={onConfirm}>
								{confirmLabel}
							</button>
						</Dialog.Close>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
