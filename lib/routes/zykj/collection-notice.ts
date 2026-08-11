import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { MAIN_NEWS_CATEGORIES, DEPARTMENTS, NOTICE_COLLECTION_KEYS } from './config';
import { parseList, type DepartmentConfig } from './utils';

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
    radar: {
        title: '通知公告合集',
        source: ['zykj.edu.cn'],
        target: '/collection/notice',
    },
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
                const { data: response } = await got(config.url);
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
        const aTime = a.pubDate?.getTime() ?? 0;
        const bTime = b.pubDate?.getTime() ?? 0;
        return bTime - aTime;
    });

    const topItems = allItems.slice(0, limit);

    // Fetch details for each item
    const details = await Promise.all(
        topItems.map((item) =>
            cache.tryGet(item.link!, async () => {
                const source = item._source;
                // Determine detail parser type
                let detailParser: string = 'vsb';
                if (source === '就业信息网') {
                    detailParser = 'goworkla';
                } else if (source === '立心书院' || source === '鼎元书院' || source === '土木工程学院' || source === '机电工程学院' || source === '信息工程学院' || source === '电气与电子工程学院' || source === '中天书院' || source === '原初书院' || source === '公共艺术教育教学中心' || source === '马克思主义学院' || source === '公共体育教育教学中心') {
                    detailParser = 'p8cm';
                }

                try {
                    const { data: detailResponse } = await got(item.link!);
                    const $ = load(detailResponse);

                    if (detailParser === 'goworkla') {
                        const title = $('div.newsXiang h4').text().trim() || item.title;
                        const content = $('#articleContent').html() || '';
                        let author: string | undefined;
                        let pubDate = item.pubDate;
                        $('p.nw_p1 span').each((_, el) => {
                            const text = $(el).text().trim();
                            if (text.includes('年') && text.includes('月') && text.includes('日')) {
                                const m = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
                                if (m) pubDate = parseDate(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
                            } else if (text && !/^\d+$/.test(text)) {
                                author = text;
                            }
                        });
                        return { ...item, title, description: content || item.description, author, pubDate } as DataItem;
                    }

                    // VSB / P8CMS shared parsing
                    const title =
                        $('h1.news_det_l_title').text().trim() ||
                        $('div.n_con_tit h2').text().trim() ||
                        $('div.art-tit h3').text().trim() ||
                        $('div.sec-title h2').text().trim() ||
                        $('h1.news_det_title1').text().trim() ||
                        $('div.detail-container h2').text().trim() ||
                        item.title;

                    const content =
                        $('#vsb_content_1003 .v_news_content').html() ||
                        $('#vsb_content .v_news_content').html() ||
                        $('.v_news_content').html() ||
                        $('div.news_det_l_con').html() ||
                        $('div.news_det_con').html() ||
                        $('div.detail-content').html() ||
                        $('article.article .v_news_content').html() ||
                        $('article.article').html() ||
                        '';

                    let author = item.author;
                    let pubDate = item.pubDate;

                    // Try all meta patterns
                    const $dateBox = $('div.news_det_l_date, div.news_det_sm');
                    if ($dateBox.length) {
                        $dateBox.find('div.item').each((_, el) => {
                            const text = $(el).text().trim();
                            if (text.includes('发布人') || text.includes('作者') || text.includes('来源')) {
                                const m = text.replace(/^(发布人|作者|来源)[:：]/, '').trim();
                                if (m) author = m;
                            } else if (text.includes('发布时间') || text.includes('发布日期')) {
                                const dateStr = text.replace(/^(发布时间|发布日期)[:：]/, '').trim();
                                pubDate = parseDate(dateStr);
                            }
                        });
                    }

                    if (!author || !pubDate) {
                        const $tip = $('div.detail-tip');
                        if ($tip.length) {
                            $tip.find('p').each((_, el) => {
                                const text = $(el).text().trim();
                                if (text.includes('发布人')) {
                                    const m = text.replace(/^发布人[:：]/, '').trim();
                                    if (m && !author) author = m;
                                } else if (text.includes('发布时间')) {
                                    const dateStr = text.replace(/^发布时间[:：]/, '').trim();
                                    if (!pubDate) pubDate = parseDate(dateStr);
                                }
                            });
                        }
                    }

                    if (!author || !pubDate) {
                        const $sxdiv = $('div.n_con_tit div.sxdiv');
                        if ($sxdiv.length) {
                            $sxdiv.find('span').each((_, el) => {
                                const text = $(el).text().trim();
                                if (text && !text.includes('浏览') && !text.includes('审') && !text.includes('审核')) {
                                    if (/\d{4}-\d{2}-\d{2}/.test(text) && !pubDate) {
                                        pubDate = parseDate(text);
                                    } else if (!author) {
                                        author = text;
                                    }
                                }
                            });
                        }
                    }

                    if (!pubDate) {
                        const $artP = $('div.art-tit p');
                        if ($artP.length) {
                            const text = $artP.text();
                            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
                            if (dateMatch) pubDate = parseDate(dateMatch[1]);
                        }
                    }

                    if (!pubDate || !author) {
                        const $lead = $('div.sec-title p.lead');
                        if ($lead.length) {
                            const text = $lead.text();
                            if (!author) {
                                const sourceMatch = text.match(/来源[:：]\s*(\S+)/);
                                if (sourceMatch) author = sourceMatch[1];
                            }
                            if (!pubDate) {
                                const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
                                if (dateMatch) pubDate = parseDate(dateMatch[1]);
                            }
                        }
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
        title: '通知公告 - 中原科技学院',
        description: '各书院、学院、党政机构通知公告合集',
        link: 'https://www.zykj.edu.cn/index/xwzx/tzgg.htm',
        item: details,
        allowEmpty: true,
    };
}
