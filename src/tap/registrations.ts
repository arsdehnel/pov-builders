import { TapRegistrations } from 'rwsdk-atp/tap';

import xyzStatusphereStatus from './xyz-statusphere-status';

const tapRegistrations = new TapRegistrations();
tapRegistrations.registerQueueConsumer(xyzStatusphereStatus.forRegistration());

export default tapRegistrations;
