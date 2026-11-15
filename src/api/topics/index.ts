import topicRoutes from './topic';
import topicStanceRoutes from './topic-stance';
import topicStancesRoutes from './topic-stances';
import topicValueRoutes from './topic-value';
import topicValuesRoutes from './topic-values';
import topicsRoutes from './topics';

export default {
	topics: topicsRoutes,
	topic: topicRoutes,
	topicStances: topicStancesRoutes,
	topicStance: topicStanceRoutes,
	topicValues: topicValuesRoutes,
	topicValue: topicValueRoutes,
};
