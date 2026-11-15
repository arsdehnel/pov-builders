import objectPath from 'object-path';

interface MdxModule {
	default: React.ComponentType;
	frontmatter: { title: string; order: number };
}

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx', { eager: true });

export const topics: Record<string, Record<string, Record<string, string>>> = {};

Object.entries(modules).forEach(([path, content]) => {
	const [, , contentLocation, topic, contentType, contentItem] = path.replaceAll('.mdx', '').split('/');
	if (contentLocation === 'topics') {
		objectPath.set(topics, [topic, contentType, contentItem], { content: content.default.displayName, ...content.frontmatter });
	}
});
