import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { DEPARTMENTS } from './config';
import { parseList, ZYKJ_TIMEOUT } from './utils';

export const route: Route = {
    path: '/notice/:department',
    name: '部门通知公告',
    url: 'zykj.edu.cn',
    maintainers: ['ChengMingXuan'],
    categories: ['university'],
    example: '/zykj/notice/lxsy',
    parameters: { department: '部门标识，见下表' },
    description: `:::tip
支持以下部门通知公告，可在对应部门网站中找到。

#### 经济与管理学部 · 立心书院

| 立心书院 | 经济学院 | 管理学院 |
| ------- | ------- | ------- |
| [lxsy](https://rsshub.app/zykj/notice/lxsy) | [jjxy](https://rsshub.app/zykj/notice/jjxy) | [glxy](https://rsshub.app/zykj/notice/glxy) |

#### 理工学部 · 鼎元书院

| 鼎元书院 | 土木工程学院 | 机电工程学院 | 信息工程学院 | 电气与电子工程学院 |
| ------- | ----------- | ----------- | ----------- | ---------------- |
| [dysy](https://rsshub.app/zykj/notice/dysy) | [tjxy](https://rsshub.app/zykj/notice/tjxy) | [jdxy](https://rsshub.app/zykj/notice/jdxy) | [xxgcxy](https://rsshub.app/zykj/notice/xxgcxy) | [dqydzgcxy](https://rsshub.app/zykj/notice/dqydzgcxy) |

#### 人文学部 · 中天书院

| 中天书院 | 外国语学院 | 文学与传媒学院 |
| ------- | --------- | ------------ |
| [ztsy](https://rsshub.app/zykj/notice/ztsy) | [wyxy](https://rsshub.app/zykj/notice/wyxy) | [wcxy](https://rsshub.app/zykj/notice/wcxy) |

#### 教育与艺术学部 · 原初书院

| 原初书院 | 教育学院 | 音乐舞蹈学院 | 艺术设计学院 | 公共艺术教育教学中心 |
| ------- | ------- | ----------- | ----------- | ------------------ |
| [ycsy](https://rsshub.app/zykj/notice/ycsy) | [jyxy](https://rsshub.app/zykj/notice/jyxy) | [yywdxy](https://rsshub.app/zykj/notice/yywdxy) | [yssjxy](https://rsshub.app/zykj/notice/yssjxy) | [ggys](https://rsshub.app/zykj/notice/ggys) |

#### 其他学院

| 马克思主义学院 | 公共体育教育教学中心 |
| ------------- | ------------------ |
| [mkszyxy](https://rsshub.app/zykj/notice/mkszyxy) | [ggtyjyzx](https://rsshub.app/zykj/notice/ggtyjyzx) |

#### 党政机构

| 党委组织（统战）部 | 党委宣传部 | 纪委办公室 | 教师发展中心 | 学生发展处 | 后勤管理处 | 校工会 | 校团委 |
| ----------------- | --------- | --------- | ----------- | --------- | --------- | ------ | ------ |
| [dwzzb](https://rsshub.app/zykj/notice/dwzzb) | [xwzx](https://rsshub.app/zykj/notice/xwzx) | [jwbgs](https://rsshub.app/zykj/notice/jwbgs) | [jsfzzx](https://rsshub.app/zykj/notice/jsfzzx) | [xgc](https://rsshub.app/zykj/notice/xgc) | [hqc](https://rsshub.app/zykj/notice/hqc) | [gh](https://rsshub.app/zykj/notice/gh) | [tw](https://rsshub.app/zykj/notice/tw) |

| 校长办公室 | 发展规划处 | 教务处上级文件 | 教务处学校文件 | 科技处公示公告 | 招生信息网 | 就业信息网 |
| --------- | --------- | ------------ | ------------ | ----------- | --------- | --------- |
| [dzb](https://rsshub.app/zykj/notice/dzb) | [fzghc](https://rsshub.app/zykj/notice/fzghc) | [jwc_sjwj](https://rsshub.app/zykj/notice/jwc_sjwj) | [jwc_xxwj](https://rsshub.app/zykj/notice/jwc_xxwj) | [kjc](https://rsshub.app/zykj/notice/kjc) | [zs](https://rsshub.app/zykj/notice/zs) | [job](https://rsshub.app/zykj/notice/job) |

| 校地合作处 | 国际合作与交流处 | 人力资源处 | 信息化建设与管理中心 | 图书馆 | 学报编辑部 | 心理健康教育中心 | 校友会办公室 |
| --------- | --------------- | --------- | ------------------- | ------ | --------- | --------------- | ----------- |
| [oia](https://rsshub.app/zykj/notice/oia) | [gjhzyjlc](https://rsshub.app/zykj/notice/gjhzyjlc) | [hr](https://rsshub.app/zykj/notice/hr) | [nic](https://rsshub.app/zykj/notice/nic) | [tsg](https://rsshub.app/zykj/notice/tsg) | [xbbjb](https://rsshub.app/zykj/notice/xbbjb) | [xljkjyzx](https://rsshub.app/zykj/notice/xljkjyzx) | [xyh](https://rsshub.app/zykj/notice/xyh) |

所有条目获取：标题、作者、链接、发布日期、内容（链接内的内容）。
:::`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(DEPARTMENTS).map(([key, config]) => ({
        title: config.name,
        source: [config.url.replace(/^https?:\/\//, '').replace(/\/$/, '')],
        target: `/notice/${key}`,
    })),
    handler,
};

async function handler(ctx) {
    const department = ctx.req.param('department');
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const config = DEPARTMENTS[department];

    if (!config) {
        throw new Error(`Invalid department: ${department}. Supported: ${Object.keys(DEPARTMENTS).join(', ')}`);
    }

    const { data: response } = await got(config.url, ZYKJ_TIMEOUT);
    const items = parseList(response, config).slice(0, limit);

    const details = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const { data: detailResponse } = await got(item.link!, ZYKJ_TIMEOUT);
                    const $ = load(detailResponse);

                    // Parse detail based on detailParser type
                    if (config.detailParser === 'goworkla') {
                        // goworkla CMS (job.zykj.edu.cn)
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

                        return {
                            ...item,
                            title,
                            description: content || item.description,
                            author,
                            pubDate,
                        } as DataItem;
                    }

                    // VSB / P8CMS detail page (shared parsing logic)
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

                    // Pattern 1: div.news_det_l_date / div.news_det_sm > div.item
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

                    // Pattern 2: div.detail-tip > p
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

                    // Pattern 3: div.n_con_tit div.sxdiv span
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

                    // Pattern 4: div.art-tit p
                    if (!pubDate) {
                        const $artP = $('div.art-tit p');
                        if ($artP.length) {
                            const text = $artP.text();
                            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
                            if (dateMatch) pubDate = parseDate(dateMatch[1]);
                        }
                    }

                    // Pattern 5: div.sec-title p.lead
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
        title: `${config.name}通知公告 - 中原科技学院`,
        description: config.name,
        link: config.url,
        item: details,
        allowEmpty: true,
    };
}
