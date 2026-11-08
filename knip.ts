export default {
	tags: ['-lintignore', '-knipTestExport'],
	ignoreDependencies: ['cloudflare'],
	ignoreExportsUsedInFile: true,
	ignoreFiles: ['src/client.tsx', 'release.config.js'],
	compilers: {
		css: (text: string): string => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
	},
};
