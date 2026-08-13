import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { MAIN_NEWS_CATEGORIES, NEWS_COLLECTION_KEYS } from './config';
import { parseList, ZYKJ_TIMEOUT, type DepartmentConfig } from './utils';

export const route: Route = {
    path: '/collection/news',
    name: '新闻动态合集',
    url: 'www.zykj.edu.cn',
    maintainers: ['ChengMingXuan'],
    categories: ['university'],
    example: '/zykj/collection/news',
    description: `学校要闻、科研聚焦、教学动态、基层风采、媒体关注的合集。
- **学校要闻、科研聚焦、教学动态、基层风采**：获取封面、标题、作者、链接、发布日期、内容
- **媒体关注**：获取标题、作者、链接、发布日期、内容`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '新闻动态合集',
            source: ['www.zykj.edu.cn/index/xwzx/'],
            target: '/collection/news',
        },
    ],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    // Fetch all news categories concurrently
    const allItems: DataItem[] = [];
    const results = await Promise.all(
        NEWS_COLLECTION_KEYS.map(async (key) => {
            const cat = MAIN_NEWS_CATEGORIES[key];
            const config: DepartmentConfig = {
                name: cat.name,
                url: cat.url,
                baseUrl: 'https://www.zykj.edu.cn',
                listParser: cat.listParser as DepartmentConfig['listParser'],
                detailParser: 'vsb',
            };
            try {
                const { data: response } = await got(config.url, ZYKJ_TIMEOUT);
                return parseList(response, config).map((item) => ({
                    ...item,
                    _category: cat.name,
                }));
            } catch {
                return [];
            }
        })
    );

    for (const items of results) {
        allItems.push(...items);
    }

    // Sort by pubDate descending
    allItems.sort((a, b) => {
        const aTime = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const bTime = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return bTime - aTime;
    });

    // Collections intentionally return list summaries only. Fetching details for every entry
    // turns five list requests into dozens of long-tail requests and exceeds Vercel's budget.
    const details = allItems.slice(0, Math.min(Math.max(limit, 1), 50)).map((item) => {
        const { _category, ...cleanItem } = item as DataItem & { _category?: string };
        return { ...cleanItem, category: _category } as DataItem;
    });

    return {
        title: '新闻动态 - 中原科技学院',
        description: '学校要闻、科研聚焦、教学动态、基层风采、媒体关注合集',
        link: 'https://www.zykj.edu.cn/index/xwzx/',
        item: details,
        allowEmpty: true,
    };
}
