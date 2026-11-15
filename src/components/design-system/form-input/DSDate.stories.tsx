import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DSDate } from './DSDate';

const meta: Meta<typeof DSDate> = {
	component: DSDate,
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof DSDate>;

export const Empty: Story = {
	args: {
		name: 'harvest_date',
		value: '',
		onBlur: fn(),
		onChange: fn(),
	},
};

export const WithValue: Story = {
	args: {
		name: 'harvest_date',
		value: '2024-06-15',
		onBlur: fn(),
		onChange: fn(),
	},
};
