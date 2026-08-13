import { load } from 'cheerio';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// The RSSHub "got" compatibility layer is backed by ofetch, which accepts a numeric timeout.
// Bound each upstream list request so Vercel can return a partial collection instead of timing out.
export const ZYKJ_TIMEOUT = { timeout: 4000, retry: 0 };
export const gotExtended = got.extend(ZYKJ_TIMEOUT);

// ===== Types =====

export type ListParserType = 'vsb_cover' | 'vsb_label' | 'vsb_zsjz' | 'vsb_wslb' | 'vsb_textlist' | 'vsb_textlist_hr' | 'vsb_textlist_xgc' | 'vsb_listitem' | 'p8cm_infolist' | 'goworkla';

export type DetailParserType = 'vsb' | 'p8cm' | 'goworkla';

export interface DepartmentConfig {
    /** Department name in Chinese */
    name: string;
    /** Full list URL */
    url: string;
    /** Base URL for resolving relative links (e.g. https://glxy.zykj.edu.cn) */
    baseUrl: string;
    /** List page parser type */
    listParser: ListParserType;
    /** Detail page parser type */
    detailParser: DetailParserType;
}

// ===== List Parsers =====

/**
 * Parse VSB main campus news list with covers (学校要闻 etc.)
 * Structure: dl.news_list2 > dd > a > div.news_list2_pic(img + time) + div.news_list2_con(title + source + summary)
 */
function parseVsbCover($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('dl.news_list2 dd').each((_, elem) => {
        const $dd = $(elem);
        const $a = $dd.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const $pic = $dd.find('div.news_list2_pic');
        const coverSrc = $pic.find('img').attr('src');
        const cover = coverSrc ? new URL(coverSrc, baseUrl + '/').href : undefined;

        const day = $pic.find('div.days').text().trim();
        const month = $pic.find('div.month').text().trim(); // e.g. "2026.08"
        const pubDate = parseDate(`${month}.${day}`);

        const title = $dd.find('div.news_list2_tt').text().trim();
        const sourceText = $dd.find('div.news_list2_ly').text().trim();
        const author = sourceText.replace(/^来源[:：]/, '').trim();
        const summary = $dd.find('div.news_list2_text').text().trim();

        items.push({
            title,
            link,
            pubDate,
            author,
            description: summary,
            ...(cover && { image: cover }),
        });
    });
    return items;
}

/**
 * Parse VSB main campus label-style list (通知公告, 媒体关注)
 * Structure: div.label_theme_pic_com_ul9 > div.item > div.container > div.date + div.text2(h3 > a + p.source + p.summary)
 */
function parseVsbLabel($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.label_theme_pic_com_ul9 div.item').each((_, elem) => {
        const $item = $(elem);
        const $a = $item.find('h3 a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const day = $item.find('div.date span.d').text().trim();
        const year = $item.find('div.date span.y').text().trim();
        const pubDate = parseDate(`${year}-${day}`);

        const title = $a.attr('title') || $a.text().trim();
        const sourceText = $item.find('p.source').text().trim();
        const author = sourceText.replace(/^来源[:：]/, '').trim();
        const summary = $item.find('p.summary').text().trim();

        items.push({
            title,
            link,
            pubDate,
            author,
            description: summary,
        });
    });
    return items;
}

/**
 * Parse VSB zsjz_list1 template (dwzzb, tsg, jwc)
 * Structure: dl.zsjz_list1 > dd > a > div.tt + div.time
 */
function parseVsbZsjz($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('dl.zsjz_list1 dd').each((_, elem) => {
        const $dd = $(elem);
        const $a = $dd.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = link.startsWith('http') ? link : new URL(link, baseUrl + '/').href;

        const title = $dd.find('div.tt').text().trim();
        const dateText = $dd.find('div.time').text().trim();
        const pubDate = parseDate(dateText);

        items.push({
            title,
            link,
            pubDate,
        });
    });
    return items;
}

/**
 * Parse VSB wslb template (glxy)
 * Structure: div.wslb > ul > li > a > div.wtime(span day + span year) + div.lbt(h4 + p summary)
 */
function parseVsbWslb($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.wslb ul li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const $wtime = $li.find('div.wtime');
        const day = $wtime.find('span').first().text().trim();
        const year = $wtime.find('span').last().text().trim();
        const pubDate = parseDate(`${year}-${day}`);

        const title = $li.find('div.lbt h4').text().trim();
        const summary = $li.find('div.lbt p').text().trim();

        items.push({
            title,
            link,
            pubDate,
            description: summary,
        });
    });
    return items;
}

/**
 * Parse VSB text-list template (kjc)
 * Structure: div.text-list > ul > li > span.date + a[title]
 */
function parseVsbTextlist($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.text-list ul li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const dateText = $li.find('span.date').text().trim();
        const pubDate = parseDate(dateText);
        const title = $a.attr('title') || $a.text().trim();

        items.push({
            title,
            link,
            pubDate,
        });
    });
    return items;
}

/**
 * Parse VSB text-list HR template (hr)
 * Structure: div.text-list > UL > li.no > a > div.tl-data(p day + span year) + div.tl-info2(h3 + p summary)
 */
function parseVsbTextlistHr($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.text-list ul li, div.text-list UL li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const $data = $li.find('div.tl-data');
        const day = $data.find('p').text().trim();
        const year = $data.find('span').text().trim();
        const pubDate = parseDate(`${year}-${day}`);

        const title = $li.find('div.tl-info2 h3').text().trim();
        const summary = $li.find('div.tl-info2 p').text().trim();

        items.push({
            title,
            link,
            pubDate,
            description: summary,
        });
    });
    return items;
}

/**
 * Parse VSB text-list XGC template (xgc)
 * Structure: div.text-list > ul > li > a > div.time(time > span day + span year) + div.txt(h3.titline + p.line2)
 */
function parseVsbTextlistXgc($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.text-list ul li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const $time = $li.find('div.time time');
        const day = $time.find('span').first().text().trim();
        const yearMonth = $time.find('span').last().text().trim(); // e.g. "2026-05"
        const pubDate = parseDate(`${yearMonth}-${day}`);

        const title = $li.find('h3.titline').text().trim();
        const summary = $li.find('p.line2').text().trim();

        items.push({
            title,
            link,
            pubDate,
            description: summary,
        });
    });
    return items;
}

/**
 * Parse VSB list-item template (nic)
 * Structure: div.list > div.list-item > a.li-title + div.li-meta(span date + span source) + p.li-sum
 */
function parseVsbListItem($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('div.list div.list-item').each((_, elem) => {
        const $item = $(elem);
        const $a = $item.find('a.li-title').first();
        let link = $a.attr('href');
        if (!link) return;
        link = new URL(link, baseUrl + '/').href;

        const $meta = $item.find('div.li-meta');
        const dateText = $meta.find('span').first().text().trim();
        const pubDate = parseDate(dateText);
        const sourceText = $meta.find('span').last().text().trim();
        const author = sourceText.replace(/^来源[:：]/, '').trim();

        const title = $a.text().trim();
        const summary = $item.find('p.li-sum').text().trim();

        items.push({
            title,
            link,
            pubDate,
            author,
            description: summary,
        });
    });
    return items;
}

/**
 * Parse P8CMS info-list template (lxsy, jjxy, dysy, etc.)
 * Structure: ul.info-list > li > a > p.fr.date + p.info-summary
 */
function parseP8cmInfolist($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('ul.info-list li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        let link = $a.attr('href');
        if (!link) return;
        link = link.startsWith('http') ? link : new URL(link, baseUrl + '/').href;

        const dateText = $li.find('p.fr.date, p.date').text().trim();
        const pubDate = parseDate(dateText);
        const title = $li.find('p.info-summary').text().trim();

        items.push({
            title,
            link,
            pubDate,
        });
    });
    return items;
}

/**
 * Parse goworkla CMS list (job)
 * Structure: ul.yinRightContains > li > a[onclick] > i + p > span.reds(title) + span.tim(date)
 */
function parseGoworkla($: ReturnType<typeof load>, baseUrl: string): DataItem[] {
    const items: DataItem[] = [];
    $('ul.yinRightContains li').each((_, elem) => {
        const $li = $(elem);
        const $a = $li.find('a').first();
        const onclick = $a.attr('onclick');
        if (!onclick) return;

        // Parse articleClick('False','156462','8687','False','','...')
        const match = onclick.match(/articleClick\('([^']*)','([^']*)','([^']*)'/);
        if (!match) return;

        const numberid = match[2];
        const navNid = match[3];
        const link = `${baseUrl}/module/newsdetail/id-${numberid}/nid-${navNid}`;

        const title = $li.find('span.reds').text().trim();
        const dateText = $li.find('span.tim').text().trim();
        const pubDate = parseDate(dateText.replace(/\//g, '-'));

        items.push({
            title,
            link,
            pubDate,
        });
    });
    return items;
}

// ===== List Parser Dispatcher =====

export function parseList(html: string, config: DepartmentConfig): DataItem[] {
    const $ = load(html);
    switch (config.listParser) {
        case 'vsb_cover':
            return parseVsbCover($, config.baseUrl);
        case 'vsb_label':
            return parseVsbLabel($, config.baseUrl);
        case 'vsb_zsjz':
            return parseVsbZsjz($, config.baseUrl);
        case 'vsb_wslb':
            return parseVsbWslb($, config.baseUrl);
        case 'vsb_textlist':
            return parseVsbTextlist($, config.baseUrl);
        case 'vsb_textlist_hr':
            return parseVsbTextlistHr($, config.baseUrl);
        case 'vsb_textlist_xgc':
            return parseVsbTextlistXgc($, config.baseUrl);
        case 'vsb_listitem':
            return parseVsbListItem($, config.baseUrl);
        case 'p8cm_infolist':
            return parseP8cmInfolist($, config.baseUrl);
        case 'goworkla':
            return parseGoworkla($, config.baseUrl);
        default:
            return [];
    }
}

// ===== Detail Parsers =====

/**
 * Parse VSB/P8CMS detail page (various sub-templates)
 * Tries multiple selectors for title, author, date, and content
 */
function parseVsbDetail($: ReturnType<typeof load>): Partial<DataItem> {
    // Title: try multiple selectors
    const title =
        $('h1.news_det_l_title').text().trim() ||
        $('div.n_con_tit h2').text().trim() ||
        $('div.art-tit h3').text().trim() ||
        $('div.sec-title h2').text().trim() ||
        $('h1.news_det_title1').text().trim() ||
        $('div.detail-container h2').text().trim();

    // Content: try multiple selectors
    const content =
        $('#vsb_content_1003 .v_news_content').html() ||
        $('#vsb_content .v_news_content').html() ||
        $('.v_news_content').html() ||
        $('div.news_det_l_con').html() ||
        $('div.news_det_con').html() ||
        $('div.detail-content').html() ||
        $('article.article .v_news_content').html() ||
        $('article.article').html();

    // Author and date: try multiple meta selectors
    let author: string | undefined;
    let pubDate: Date | undefined;

    // Pattern 1: div.news_det_l_date > div.item (VSB main, dwzzb, jjxy, tsg)
    const $dateBox = $('div.news_det_l_date, div.news_det_sm');
    if ($dateBox.length) {
        $dateBox.find('div.item').each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes('发布人') || text.includes('作者')) {
                author = text.replace(/^(发布人|作者)[:：]/, '').trim() || undefined;
            } else if (text.includes('发布时间') || text.includes('发布日期')) {
                const dateStr = text.replace(/^(发布时间|发布日期)[:：]/, '').trim();
                pubDate = parseDate(dateStr);
            }
        });
    }

    // Pattern 2: div.detail-tip > p (P8CMS lxsy)
    if (!author || !pubDate) {
        const $tip = $('div.detail-tip');
        if ($tip.length) {
            $tip.find('p').each((_, el) => {
                const text = $(el).text().trim();
                if (text.includes('发布人')) {
                    author = text.replace(/^发布人[:：]/, '').trim() || undefined;
                } else if (text.includes('发布时间')) {
                    pubDate = parseDate(text.replace(/^发布时间[:：]/, '').trim());
                }
            });
        }
    }

    // Pattern 3: div.n_con_tit div.sxdiv span (glxy)
    if (!author || !pubDate) {
        const $sxdiv = $('div.n_con_tit div.sxdiv');
        if ($sxdiv.length) {
            const spans = $sxdiv.find('span').toArray();
            for (const span of spans) {
                const text = $(span).text().trim();
                if (text && !text.includes('浏览') && !text.includes('审') && !text.includes('审核')) {
                    if (/\d{4}-\d{2}-\d{2}/.test(text)) {
                        pubDate = parseDate(text);
                    } else if (!author) {
                        author = text;
                    }
                }
            }
        }
    }

    // Pattern 4: div.art-tit p span (kjc)
    if (!pubDate) {
        const $artP = $('div.art-tit p');
        if ($artP.length) {
            const text = $artP.text();
            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                pubDate = parseDate(dateMatch[1]);
            }
        }
    }

    // Pattern 5: div.sec-title p.lead (nic)
    if (!pubDate || !author) {
        const $lead = $('div.sec-title p.lead');
        if ($lead.length) {
            const text = $lead.text();
            const sourceMatch = text.match(/来源[:：]\s*(\S+)/);
            if (sourceMatch && !author) {
                author = sourceMatch[1];
            }
            const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch && !pubDate) {
                pubDate = parseDate(dateMatch[1]);
            }
        }
    }

    const result: Partial<DataItem> = {};
    if (title) result.title = title;
    if (content) result.description = content;
    if (author) result.author = author;
    if (pubDate) result.pubDate = pubDate;
    return result;
}

/**
 * Parse goworkla detail page (job.zykj.edu.cn)
 */
function parseGoworklaDetail($: ReturnType<typeof load>): Partial<DataItem> {
    const title = $('div.newsXiang h4').text().trim();

    // Parse meta from p.nw_p1
    const $meta = $('p.nw_p1');
    let author: string | undefined;
    let pubDate: Date | undefined;
    const spans = $meta.find('span').toArray();
    for (const span of spans) {
        const text = $(span).text().trim();
        if (text.includes('年') && text.includes('月') && text.includes('日')) {
            const dateMatch = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (dateMatch) {
                pubDate = parseDate(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`);
            }
        } else if (text && !text.match(/^\d+$/)) {
            author = text;
        }
    }

    const content = $('#articleContent').html();

    const result: Partial<DataItem> = {};
    if (title) result.title = title;
    if (content) result.description = content;
    if (author) result.author = author;
    if (pubDate) result.pubDate = pubDate;
    return result;
}

// ===== Detail Parser Dispatcher =====

export async function parseDetail(item: DataItem, config: DepartmentConfig): Promise<DataItem> {
    return cache.tryGet(item.link!, async () => {
        try {
            const { data: response } = await got(item.link!, ZYKJ_TIMEOUT);
            const $ = load(response);

            let detail: Partial<DataItem>;
            if (config.detailParser === 'goworkla') {
                detail = parseGoworklaDetail($);
            } else {
                detail = parseVsbDetail($);
            }

            return {
                ...item,
                ...detail,
                description: detail.description || item.description,
            };
        } catch {
            return item;
        }
    });
}

// ===== Fetch Helper =====

export async function fetchList(config: DepartmentConfig, limit?: number): Promise<DataItem[]> {
    const { data: response } = await gotExtended(config.url);
    let items = parseList(response, config);
    if (limit) {
        items = items.slice(0, limit);
    }
    return items;
}

export async function fetchListWithDetails(config: DepartmentConfig, limit?: number): Promise<DataItem[]> {
    const items = await fetchList(config, limit);
    return Promise.all(items.map((item) => parseDetail(item, config)));
}
