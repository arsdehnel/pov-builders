import type { Meta, StoryObj } from '@storybook/react';
import DSButton from './DSButton';

const meta: Meta<typeof DSButton> = {
	component: DSButton,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof DSButton>;

export const Default: Story = {
	args: {
		isSubmitting: false,
		label: 'Save Recipe',
	},
};

export const Submitting: Story = {
	args: {
		isSubmitting: true,
		label: 'Save Recipe',
	},
};

export const LongLabel: Story = {
	args: {
		isSubmitting: false,
		label: 'Save changes to this recipe and update all related seasonal ingredients',
	},
};
