export default {
	tags: ['-lintignore', '-knipTestExport'],
	ignoreDependencies: ['cloudflare', 'object-path', '@types/object-path'],
	ignoreExportsUsedInFile: true,
	ignoreFiles: ['src/client.tsx', 'release.config.js', 'src/content/markdown.ts'],
	compilers: {
		css: (text: string): string => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
	},
};
