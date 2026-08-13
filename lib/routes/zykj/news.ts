import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { MAIN_NEWS_CATEGORIES } from './config';
import { parseList, ZYKJ_TIMEOUT, type DepartmentConfig } from './utils';

export const route: Route = {
    path: '/news/:category?',
    name: '学院新闻资讯',
    url: 'www.zykj.edu.cn',
    maintainers: ['ChengMingXuan'],
    categories: ['university'],
    example: '/zykj/news/xxyw',
    parameters: { category: '分类，见下表，默认为学校要闻' },
    description: `:::tip
支持以下分类，可在对应分类页 URL 中找到参数。

| 学校要闻 | 科研聚焦 | 教学动态 | 基层风采 | 媒体关注 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| [xxyw](https://rsshub.app/zykj/news/xxyw) | [kyjj](https://rsshub.app/zykj/news/kyjj) | [jxdt](https://rsshub.app/zykj/news/jxdt) | [jcfc](https://rsshub.app/zykj/news/jcfc) | [mtgz](https://rsshub.app/zykj/news/mtgz) | [tzgg](https://rsshub.app/zykj/news/tzgg) |

- **学校要闻、科研聚焦、教学动态、基层风采**：获取封面、标题、作者、链接、发布日期、内容
- **媒体关注、通知公告**：获取标题、作者、链接、发布日期、内容
:::`,
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
            title: '学校要闻',
            source: ['www.zykj.edu.cn/index/xwzx/xxyw.htm'],
            target: '/news/xxyw',
        },
        {
            title: '科研聚焦',
            source: ['www.zykj.edu.cn/index/xwzx/kyjj.htm'],
            target: '/news/kyjj',
        },
        {
            title: '教学动态',
            source: ['www.zykj.edu.cn/index/xwzx/jxdt.htm'],
            target: '/news/jxdt',
        },
        {
            title: '基层风采',
            source: ['www.zykj.edu.cn/index/xwzx/jcfc.htm'],
            target: '/news/jcfc',
        },
        {
            title: '媒体关注',
            source: ['www.zykj.edu.cn/index/xwzx/mtgz.htm'],
            target: '/news/mtgz',
        },
        {
            title: '通知公告',
            source: ['www.zykj.edu.cn/index/xwzx/tzgg.htm'],
            target: '/news/tzgg',
        },
    ],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'xxyw';
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const cat = MAIN_NEWS_CATEGORIES[category];

    if (!cat) {
        throw new Error(`Invalid category: ${category}. Supported: ${Object.keys(MAIN_NEWS_CATEGORIES).join(', ')}`);
    }

    const config: DepartmentConfig = {
        name: cat.name,
        url: cat.url,
        baseUrl: 'https://www.zykj.edu.cn',
        listParser: cat.listParser as DepartmentConfig['listParser'],
        detailParser: 'vsb',
    };

    const { data: response } = await got(config.url, ZYKJ_TIMEOUT);
    const items = parseList(response, config).slice(0, limit);

    const details = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const { data: detailResponse } = await got(item.link!, ZYKJ_TIMEOUT);
                    const $ = load(detailResponse);

                    // Title
                    const title =
                        $('h1.news_det_l_title').text().trim() ||
                        item.title;

                    // Content
                    const content =
                        $('#vsb_content_1003 .v_news_content').html() ||
                        $('#vsb_content .v_news_content').html() ||
                        $('.v_news_content').html() ||
                        $('div.news_det_l_con').html() ||
                        '';

                    // Author and date
                    let author = item.author;
                    let pubDate = item.pubDate;

                    const $dateBox = $('div.news_det_l_date');
                    if ($dateBox.length) {
                        $dateBox.find('div.item').each((_, el) => {
                            const text = $(el).text().trim();
                            if (text.includes('发布人') || text.includes('来源')) {
                                const match = text.replace(/^(发布人|来源)[:：]/, '').trim();
                                if (match) author = match;
                            } else if (text.includes('发布时间')) {
                                const dateStr = text.replace(/^发布时间[:：]/, '').trim();
                                pubDate = parseDate(dateStr);
                            }
                        });
                    }

                    return {
                        ...item,
                        title,
                        description: content || item.description,
                        author,
                        pubDate,
                    } as DataItem;
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: `${cat.name} - 中原科技学院`,
        description: cat.name,
        link: config.url,
        item: details,
        allowEmpty: true,
    };
}
