'use client';
import { RadioGroup } from 'radix-ui';
import { useState } from 'react';
import { savePositionValue } from '@/actions/position-values';
import { savePosition } from '@/actions/positions';
import { DSToast } from '@/components/design-system';
import { STANCE_ICONS } from '@/content';

export type StanceOption = {
	id: string;
	icon: string;
	label: string;
	description: string;
	color: string;
};

export default function StanceRadioCards({
	stances,
	topicId,
	valueId,
	name,
	redirectTo,
	initialStanceId,
}: {
	stances: StanceOption[];
	topicId: string;
	valueId?: string;
	name?: string;
	redirectTo?: string;
	initialStanceId?: string;
}): React.ReactNode {
	const [value, setValue] = useState(initialStanceId ?? '');
	const [toastOpen, setToastOpen] = useState(false);
	const [exiting, setExiting] = useState(false);

	async function handleSavePosition(stanceId: string): Promise<void> {
		const result = valueId
			? await savePositionValue({ topicId, valueId, stanceId })
			: await savePosition({ topicId, overallStanceId: stanceId });
		if (result.success) {
			if (redirectTo) {
				setExiting(true);
				setTimeout(() => {
					window.location.href = redirectTo;
				}, 350);
			} else {
				setToastOpen(true);
			}
		}
	}

	return (
		<>
			<RadioGroup.Root
				className={`stance-radio-cards${exiting ? ' stance-radio-cards--exiting' : ''}`}
				value={value}
				onValueChange={(newValue: string): void => {
					setValue(newValue);
					void handleSavePosition(newValue);
				}}
				name={name}
				aria-label="Select your stance"
			>
				{stances.map(stance => {
					const Icon = STANCE_ICONS[stance.icon];
					return (
						<RadioGroup.Item
							key={stance.id}
							value={stance.id}
							className="stance-radio-card"
							style={{ '--stance-color': stance.color } as React.CSSProperties}
						>
							{Icon && (
								<div className="stance-radio-card-icon">
									<Icon width={32} height={32} />
								</div>
							)}
							<div className="stance-radio-card-content">
								<div className="stance-radio-card-title">{stance.label}</div>
								<div className="stance-radio-card-body">{stance.description}</div>
							</div>
						</RadioGroup.Item>
					);
				})}
			</RadioGroup.Root>
			{!redirectTo && <DSToast open={toastOpen} onOpenChange={setToastOpen} title="Position saved" />}
		</>
	);
}
