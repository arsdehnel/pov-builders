'use client';
import {
	ColumnSpacingIcon,
	CropIcon,
	HandIcon,
	LoopIcon,
	PauseIcon,
	RulerSquareIcon,
	TransformIcon,
} from '@radix-ui/react-icons';
import { RadioGroup } from 'radix-ui';
import { useState } from 'react';
import { savePosition } from '@/actions/positions';
import { DSToast } from '@/components/design-system';

export type StanceOption = {
	id: string;
	slug: string;
	label: string;
	description: string;
	color: string;
};

const STANCE_ICONS: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
	refuse: HandIcon,
	'wait-and-see': PauseIcon,
	constrain: CropIcon,
	compensate: LoopIcon,
	'rethink-the-work': TransformIcon,
	'shape-the-ecosystem': RulerSquareIcon,
	drift: ColumnSpacingIcon,
};

export default function StanceRadioCards({
	stances,
	topicId,
	name,
}: {
	stances: StanceOption[];
	topicId: string;
	name?: string;
}): React.ReactNode {
	const [value, setValue] = useState('');
	const [toastOpen, setToastOpen] = useState(false);

	async function handleSavePosition(overallStanceId: string): Promise<void> {
		const result = await savePosition({ topicId, overallStanceId });
		if (result.success) {
			setToastOpen(true);
		}
	}

	return (
		<>
			<RadioGroup.Root
				className="stance-radio-cards"
				value={value}
				onValueChange={(newValue: string): void => {
					setValue(newValue);
					void handleSavePosition(newValue);
				}}
				name={name}
				aria-label="Select your stance"
			>
				{stances.map(stance => {
					const Icon = STANCE_ICONS[stance.slug];
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
			<DSToast open={toastOpen} onOpenChange={setToastOpen} title="Position saved" />
		</>
	);
}
