import type { DepartmentConfig } from './utils';

// ===== Main campus news categories =====
// These use VSB CMS with cover images

export const MAIN_NEWS_CATEGORIES: Record<string, { name: string; url: string; listParser: string; withCover: boolean }> = {
    xxyw: { name: '学校要闻', url: 'https://www.zykj.edu.cn/index/xwzx/xxyw.htm', listParser: 'vsb_cover', withCover: true },
    kyjj: { name: '科研聚焦', url: 'https://www.zykj.edu.cn/index/xwzx/kyjj.htm', listParser: 'vsb_cover', withCover: true },
    jxdt: { name: '教学动态', url: 'https://www.zykj.edu.cn/index/xwzx/jxdt.htm', listParser: 'vsb_cover', withCover: true },
    jcfc: { name: '基层风采', url: 'https://www.zykj.edu.cn/index/xwzx/jcfc.htm', listParser: 'vsb_cover', withCover: true },
    mtgz: { name: '媒体关注', url: 'https://www.zykj.edu.cn/index/xwzx/mtgz.htm', listParser: 'vsb_label', withCover: false },
    tzgg: { name: '通知公告', url: 'https://www.zykj.edu.cn/index/xwzx/tzgg.htm', listParser: 'vsb_label', withCover: false },
};

// ===== Department notice configurations =====
// All use detailParser: 'vsb' unless noted otherwise

export const DEPARTMENTS: Record<string, DepartmentConfig> = {
    // --- 经济与管理学部 · 立心书院 ---
    lxsy: {
        name: '立心书院',
        url: 'https://lxsy.zykj.edu.cn/15321/',
        baseUrl: 'https://lxsy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    jjxy: {
        name: '经济学院',
        url: 'https://jjxy.zykj.edu.cn/17967/',
        baseUrl: 'https://jjxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'vsb',
    },
    glxy: {
        name: '管理学院',
        url: 'https://glxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://glxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },

    // --- 理工学部 · 鼎元书院 ---
    dysy: {
        name: '鼎元书院',
        url: 'https://dysy.zykj.edu.cn/16368/',
        baseUrl: 'https://dysy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    tjxy: {
        name: '土木工程学院',
        url: 'https://tjxy.zykj.edu.cn/13019/',
        baseUrl: 'https://tjxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    jdxy: {
        name: '机电工程学院',
        url: 'https://jdxy.zykj.edu.cn/6068/',
        baseUrl: 'https://jdxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    xxgcxy: {
        name: '信息工程学院',
        url: 'https://xxgcxy.zykj.edu.cn/17649/',
        baseUrl: 'https://xxgcxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    dqydzgcxy: {
        name: '电气与电子工程学院',
        url: 'https://dqydzgcxy.zykj.edu.cn/18889/',
        baseUrl: 'https://dqydzgcxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },

    // --- 人文学部 · 中天书院 ---
    ztsy: {
        name: '中天书院',
        url: 'https://ztsy.zykj.edu.cn/16336/',
        baseUrl: 'https://ztsy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    wyxy: {
        name: '外国语学院',
        url: 'https://wyxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://wyxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },
    wcxy: {
        name: '文学与传媒学院',
        url: 'https://wcxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://wcxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },

    // --- 教育与艺术学部 · 原初书院 ---
    ycsy: {
        name: '原初书院',
        url: 'https://ycsy.zykj.edu.cn/16304/',
        baseUrl: 'https://ycsy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    jyxy: {
        name: '教育学院',
        url: 'https://jyxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://jyxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },
    yywdxy: {
        name: '音乐舞蹈学院',
        url: 'https://yywdxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://yywdxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },
    yssjxy: {
        name: '艺术设计学院',
        url: 'https://yssjxy.zykj.edu.cn/xwgg/tzgg.htm',
        baseUrl: 'https://yssjxy.zykj.edu.cn',
        listParser: 'vsb_wslb',
        detailParser: 'vsb',
    },
    ggys: {
        name: '公共艺术教育教学中心',
        url: 'https://ggys.zykj.edu.cn/13958/',
        baseUrl: 'https://ggys.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },

    // --- 马克思主义学院 / 公共体育 ---
    mkszyxy: {
        name: '马克思主义学院',
        url: 'https://mkszyxy.zykj.edu.cn/15131/',
        baseUrl: 'https://mkszyxy.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },
    ggtyjyzx: {
        name: '公共体育教育教学中心',
        url: 'https://ggtyjyzx.zykj.edu.cn/15269/',
        baseUrl: 'https://ggtyjyzx.zykj.edu.cn',
        listParser: 'p8cm_infolist',
        detailParser: 'p8cm',
    },

    // --- 党政机构 ---
    dwzzb: {
        name: '党委组织（统战）部',
        url: 'https://dwzzb.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://dwzzb.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    xwzx: {
        name: '党委宣传部（品牌建设办公室）',
        url: 'https://xwzx.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://xwzx.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    jwbgs: {
        name: '纪委办公室',
        url: 'https://jwbgs.zykj.edu.cn/tzgg1.htm',
        baseUrl: 'https://jwbgs.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    jsfzzx: {
        name: '教师发展中心（党委教师工作部）',
        url: 'https://jsfzzx.zykj.edu.cn/pxxm.htm',
        baseUrl: 'https://jsfzzx.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    xgc: {
        name: '学生发展处',
        url: 'https://xgc.zykj.edu.cn/bmdt/tzgg.htm',
        baseUrl: 'https://xgc.zykj.edu.cn',
        listParser: 'vsb_textlist_xgc',
        detailParser: 'vsb',
    },
    hqc: {
        name: '后勤管理处',
        url: 'https://hqc.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://hqc.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    gh: {
        name: '校工会',
        url: 'https://gh.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://gh.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    tw: {
        name: '校团委',
        url: 'https://tw.zykj.edu.cn/bmdt/tzgg.htm',
        baseUrl: 'https://tw.zykj.edu.cn',
        listParser: 'vsb_textlist_xgc',
        detailParser: 'vsb',
    },
    dzb: {
        name: '校长办公室',
        url: 'https://dzb.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://dzb.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    fzghc: {
        name: '发展规划处',
        url: 'https://fzghc.zykj.edu.cn/bmdt/tzgg.htm',
        baseUrl: 'https://fzghc.zykj.edu.cn',
        listParser: 'vsb_textlist_xgc',
        detailParser: 'vsb',
    },
    jwc_sjwj: {
        name: '教务处上级文件',
        url: 'https://jwc.zykj.edu.cn/8894/',
        baseUrl: 'https://jwc.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'p8cm',
    },
    jwc_xxwj: {
        name: '教务处学校文件',
        url: 'https://jwc.zykj.edu.cn/8895/',
        baseUrl: 'https://jwc.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'p8cm',
    },
    kjc: {
        name: '科技处公示公告',
        url: 'https://kjc.zykj.edu.cn/gsgg.htm',
        baseUrl: 'https://kjc.zykj.edu.cn',
        listParser: 'vsb_textlist',
        detailParser: 'vsb',
    },
    zs: {
        name: '招生信息网',
        url: 'https://zs.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://zs.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    job: {
        name: '就业信息网',
        url: 'https://job.zykj.edu.cn/module/newslist/id-1538/nid-8687',
        baseUrl: 'https://job.zykj.edu.cn',
        listParser: 'goworkla',
        detailParser: 'goworkla',
    },
    oia: {
        name: '校地合作处',
        url: 'https://oia.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://oia.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    gjhzyjlc: {
        name: '国际合作与交流处',
        url: 'https://gjhzyjlc.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://gjhzyjlc.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    hr: {
        name: '人力资源处',
        url: 'https://hr.zykj.edu.cn/tzgg.htm',
        baseUrl: 'https://hr.zykj.edu.cn',
        listParser: 'vsb_textlist_hr',
        detailParser: 'vsb',
    },
    nic: {
        name: '信息化建设与管理中心',
        url: 'https://nic.zykj.edu.cn/index/tzgg.htm',
        baseUrl: 'https://nic.zykj.edu.cn',
        listParser: 'vsb_listitem',
        detailParser: 'vsb',
    },
    tsg: {
        name: '图书馆',
        url: 'https://tsg.zykj.edu.cn/2898/',
        baseUrl: 'https://tsg.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'p8cm',
    },
    xbbjb: {
        name: '学报编辑部学报动态',
        url: 'https://www.zykj.edu.cn/dzjg/xbbjb/xbdt.htm',
        baseUrl: 'https://www.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
    xljkjyzx: {
        name: '心理健康教育中心',
        url: 'https://xljkjyzx.zykj.edu.cn/bmdt/tzgg.htm',
        baseUrl: 'https://xljkjyzx.zykj.edu.cn',
        listParser: 'vsb_textlist_xgc',
        detailParser: 'vsb',
    },
    xyh: {
        name: '校友会办公室校友动态',
        url: 'https://xyh.zykj.edu.cn/xwdt/xydt.htm',
        baseUrl: 'https://xyh.zykj.edu.cn',
        listParser: 'vsb_zsjz',
        detailParser: 'vsb',
    },
};

// ===== Collection groups =====

// News collection: 学校要闻 + 科研聚焦 + 教学动态 + 基层风采 + 媒体关注
export const NEWS_COLLECTION_KEYS = ['xxyw', 'kyjj', 'jxdt', 'jcfc', 'mtgz'];

// Notice collection: 通知公告 + all departments
export const NOTICE_COLLECTION_KEYS = ['tzgg', ...Object.keys(DEPARTMENTS)];
