import { render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import DefaultDocument from '@/documents/default';
import headersMiddleware from '@/middleware/headers';
import Pages__root from '@/pages/home';

export default defineApp([headersMiddleware, render(DefaultDocument, [route('/', Pages__root)])]);
