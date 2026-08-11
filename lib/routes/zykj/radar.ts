import { MAIN_NEWS_CATEGORIES, DEPARTMENTS } from './config';

export const radar = [
    // Main campus news categories
    ...Object.entries(MAIN_NEWS_CATEGORIES).map(([key, cat]) => ({
        title: `${cat.name} - 中原科技学院`,
        source: [`www.zykj.edu.cn/index/xwzx/${key}.htm`],
        target: `/news/${key}`,
    })),
    // Department notices
    ...Object.entries(DEPARTMENTS).map(([key, config]) => ({
        title: `${config.name}通知公告 - 中原科技学院`,
        source: [config.url.replace(/^https?:\/\//, '')],
        target: `/notice/${key}`,
    })),
    // Collections
    {
        title: '新闻动态合集 - 中原科技学院',
        source: ['www.zykj.edu.cn/index/xwzx/'],
        target: '/collection/news',
    },
    {
        title: '通知公告合集 - 中原科技学院',
        source: ['zykj.edu.cn'],
        target: '/collection/notice',
    },
];
