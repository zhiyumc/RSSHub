import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { MAIN_NEWS_CATEGORIES, DEPARTMENTS, NOTICE_COLLECTION_KEYS } from './config';
import { parseList, ZYKJ_TIMEOUT, type DepartmentConfig } from './utils';

export const route: Route = {
    path: '/collection/notice',
    name: '通知公告合集',
    url: 'zykj.edu.cn',
    maintainers: ['ChengMingXuan'],
    categories: ['university'],
    example: '/zykj/collection/notice',
    description: `学院新闻资讯下的通知公告，各书院、学院、党政机构的通知公告的合集。
所有条目获取：标题、作者、链接、发布日期、内容（链接内的内容）。`,
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
            title: '通知公告合集',
            source: ['zykj.edu.cn'],
            target: '/collection/notice',
        },
    ],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 100;

    // Fetch all notice sources concurrently
    const allItems: (DataItem & { _source?: string })[] = [];

    const results = await Promise.all(
        NOTICE_COLLECTION_KEYS.map(async (key) => {
            let config: DepartmentConfig;
            if (key === 'tzgg') {
                const cat = MAIN_NEWS_CATEGORIES['tzgg'];
                config = {
                    name: cat.name,
                    url: cat.url,
                    baseUrl: 'https://www.zykj.edu.cn',
                    listParser: cat.listParser as DepartmentConfig['listParser'],
                    detailParser: 'vsb',
                };
            } else {
                config = DEPARTMENTS[key];
            }

            try {
                const { data: response } = await got(config.url, ZYKJ_TIMEOUT);
                return parseList(response, config).map((item) => ({
                    ...item,
                    _source: config.name,
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

    // Collections intentionally return list summaries only. Fetching details across dozens
    // of department sites causes Vercel functions to exceed their network budget.
    const details = allItems.slice(0, Math.min(Math.max(limit, 1), 50)).map((item) => {
        const { _source, ...cleanItem } = item;
        return { ...cleanItem, category: _source } as DataItem;
    });

    return {
        title: '通知公告 - 中原科技学院',
        description: '各书院、学院、党政机构通知公告合集',
        link: 'https://www.zykj.edu.cn/index/xwzx/tzgg.htm',
        item: details,
        allowEmpty: true,
    };
}
