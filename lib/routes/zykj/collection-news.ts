import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { MAIN_NEWS_CATEGORIES, NEWS_COLLECTION_KEYS } from './config';
import { parseList, type DepartmentConfig } from './utils';

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
    radar: {
        title: '新闻动态合集',
        source: ['www.zykj.edu.cn/index/xwzx/'],
        target: '/collection/news',
    },
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
                const { data: response } = await got(config.url);
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
        const aTime = a.pubDate?.getTime() ?? 0;
        const bTime = b.pubDate?.getTime() ?? 0;
        return bTime - aTime;
    });

    const topItems = allItems.slice(0, limit);

    // Fetch details for each item
    const details = await Promise.all(
        topItems.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const { data: detailResponse } = await got(item.link!);
                    const $ = load(detailResponse);

                    const title = $('h1.news_det_l_title').text().trim() || item.title;
                    const content =
                        $('#vsb_content_1003 .v_news_content').html() ||
                        $('#vsb_content .v_news_content').html() ||
                        $('.v_news_content').html() ||
                        $('div.news_det_l_con').html() ||
                        '';

                    let author = item.author;
                    let pubDate = item.pubDate;

                    const $dateBox = $('div.news_det_l_date');
                    if ($dateBox.length) {
                        $dateBox.find('div.item').each((_, el) => {
                            const text = $(el).text().trim();
                            if (text.includes('发布人') || text.includes('来源')) {
                                const m = text.replace(/^(发布人|来源)[:：]/, '').trim();
                                if (m) author = m;
                            } else if (text.includes('发布时间')) {
                                const dateStr = text.replace(/^发布时间[:：]/, '').trim();
                                pubDate = parseDate(dateStr);
                            }
                        });
                    }

                    const category = (item as DataItem & { _category?: string })._category;
                    return {
                        ...item,
                        title,
                        description: content || item.description,
                        author,
                        pubDate,
                        category,
                    } as DataItem;
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: '新闻动态 - 中原科技学院',
        description: '学校要闻、科研聚焦、教学动态、基层风采、媒体关注合集',
        link: 'https://www.zykj.edu.cn/index/xwzx/',
        item: details,
        allowEmpty: true,
    };
}
