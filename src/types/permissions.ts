// import type permissions from '@/data/permissions';

const permissions = {
	__controls: {
		read: ['*'],
	},
};

export type Permission = {
	[K in keyof typeof permissions]: `${K & string}:${keyof (typeof permissions)[K] & string}`;
}[keyof typeof permissions];
