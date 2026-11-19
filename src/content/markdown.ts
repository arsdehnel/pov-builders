import objectPath from 'object-path';

interface MdxModule {
	default: React.ComponentType;
	frontmatter: { title: string; order: number };
}

const modules = import.meta.glob<MdxModule>('../content/**/*.mdx', { eager: true });

type ContentTopics = 'ai' | 'urban-planning' | 'healthcare';
type ContentTopicElements = 'stances' | 'values';
type ContentTopic = Record<ContentTopicElements, ContentStance | ContentValue>;
type ContentTopicExport = Record<ContentTopics, ContentTopic>;
type ContentStance = {
	title: string;
	order: number;
	shade: string;
	color: string;
	description: string;
	example: string;
	characterName: string;
	characterTagline: string;
	characterBio: string;
};
type ContentValue = {
	title: string;
	order: string;
	description: string;
};

export const topics: ContentTopicExport = {} as ContentTopicExport;

Object.entries(modules).forEach(([path, content]) => {
	const [, , contentLocation, topic, contentType, contentItem] = path.replaceAll('.mdx', '').split('/');
	if (contentLocation === 'topics') {
		objectPath.set(topics, [topic, contentType, contentItem], { content: content.default.displayName, ...content.frontmatter });
	}
});
