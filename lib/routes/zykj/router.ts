import type { Route } from '@/types';
import { route as newsRoute } from './news';
import { route as noticeRoute } from './notice';
import { newsCollectionRoute, noticeCollectionRoute } from './collection';

export const routes: Route[] = [newsRoute, noticeRoute, newsCollectionRoute, noticeCollectionRoute];
