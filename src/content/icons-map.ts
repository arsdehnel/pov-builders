import {
	ColumnSpacingIcon,
	CropIcon,
	HandIcon,
	LoopIcon,
	PauseIcon,
	RulerSquareIcon,
	TransformIcon,
} from '@radix-ui/react-icons';

export const STANCE_ICONS: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
	HandIcon,
	PauseIcon,
	CropIcon,
	LoopIcon,
	TransformIcon,
	RulerSquareIcon,
	ColumnSpacingIcon,
};
