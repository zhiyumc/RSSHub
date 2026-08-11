# 中原科技学院 RSSHub 路由

## 路由总览

| 路由路径 | 名称 | 说明 |
|---------|------|------|
| `/zykj/news/:category?` | 学院新闻资讯 | 学校要闻、科研聚焦、教学动态、基层风采、媒体关注、通知公告 |
| `/zykj/notice/:department` | 部门通知公告 | 各书院、学院、党政机构通知公告（共 35 个部门） |
| `/zykj/collection/news` | 新闻动态合集 | 学校要闻 + 科研聚焦 + 教学动态 + 基层风采 + 媒体关注 |
| `/zykj/collection/notice` | 通知公告合集 | 学院通知公告 + 所有部门通知公告 |

## 文件结构

```
lib/routes/zykj/
├── namespace.ts      # 命名空间定义
├── router.ts         # 路由注册
├── maintainer.ts     # 维护者信息
├── radar.ts          # RSSHub Radar 规则
├── config.ts         # 部门配置（URL、解析器类型）
├── utils.ts          # 共享工具模块（10 种列表解析器 + 3 种详情解析器）
├── news.ts           # 学院新闻资讯路由
├── notice.ts         # 部门通知公告路由
└── collection.ts     # 合集路由
```

## 支持的 CMS 类型

本路由兼容中原科技学院网站使用的三种 CMS 系统：

| CMS | 列表解析器 | 详情解析器 | 使用场景 |
|-----|----------|----------|---------|
| VSB（思创） | `vsb_cover`, `vsb_label`, `vsb_zsjz`, `vsb_wslb`, `vsb_textlist`, `vsb_textlist_hr`, `vsb_textlist_xgc`, `vsb_listitem` | `vsb` | 主站及部分子站 |
| P8CMS | `p8cm_infolist` | `p8cm` | 部分子站（立心书院、鼎元书院等） |
| Goworkla | `goworkla` | `goworkla` | 就业信息网 |

## 学院新闻资讯 (`/zykj/news/:category?`)

| 参数 | 分类 | 需获取字段 |
|------|------|-----------|
| `xxyw` | 学校要闻 | 封面、标题、作者、链接、发布日期、内容 |
| `kyjj` | 科研聚焦 | 封面、标题、作者、链接、发布日期、内容 |
| `jxdt` | 教学动态 | 封面、标题、作者、链接、发布日期、内容 |
| `jcfc` | 基层风采 | 封面、标题、作者、链接、发布日期、内容 |
| `mtgz` | 媒体关注 | 标题、作者、链接、发布日期、内容 |
| `tzgg` | 通知公告 | 标题、作者、链接、发布日期、内容 |

## 部门通知公告 (`/zykj/notice/:department`)

所有条目获取：标题、作者、链接、发布日期、内容。

### 经济与管理学部 · 立心书院
| 标识 | 部门 |
|------|------|
| `lxsy` | 立心书院 |
| `jjxy` | 经济学院 |
| `glxy` | 管理学院 |

### 理工学部 · 鼎元书院
| 标识 | 部门 |
|------|------|
| `dysy` | 鼎元书院 |
| `tjxy` | 土木工程学院 |
| `jdxy` | 机电工程学院 |
| `xxgcxy` | 信息工程学院 |
| `dqydzgcxy` | 电气与电子工程学院 |

### 人文学部 · 中天书院
| 标识 | 部门 |
|------|------|
| `ztsy` | 中天书院 |
| `wyxy` | 外国语学院 |
| `wcxy` | 文学与传媒学院 |

### 教育与艺术学部 · 原初书院
| 标识 | 部门 |
|------|------|
| `ycsy` | 原初书院 |
| `jyxy` | 教育学院 |
| `yywdxy` | 音乐舞蹈学院 |
| `yssjxy` | 艺术设计学院 |
| `ggys` | 公共艺术教育教学中心 |

### 其他学院
| 标识 | 部门 |
|------|------|
| `mkszyxy` | 马克思主义学院 |
| `ggtyjyzx` | 公共体育教育教学中心 |

### 党政机构
| 标识 | 部门 |
|------|------|
| `dwzzb` | 党委组织（统战）部 |
| `xwzx` | 党委宣传部（品牌建设办公室） |
| `jwbgs` | 纪委办公室 |
| `jsfzzx` | 教师发展中心（党委教师工作部） |
| `xgc` | 学生发展处 |
| `hqc` | 后勤管理处 |
| `gh` | 校工会 |
| `tw` | 校团委 |
| `dzb` | 校长办公室 |
| `fzghc` | 发展规划处 |
| `jwc_sjwj` | 教务处上级文件 |
| `jwc_xxwj` | 教务处学校文件 |
| `kjc` | 科技处公示公告 |
| `zs` | 招生信息网 |
| `job` | 就业信息网 |
| `oia` | 校地合作处 |
| `gjhzyjlc` | 国际合作与交流处 |
| `hr` | 人力资源处 |
| `nic` | 信息化建设与管理中心 |
| `tsg` | 图书馆 |
| `xbbjb` | 学报编辑部学报动态 |
| `xljkjyzx` | 心理健康教育中心 |
| `xyh` | 校友会办公室校友动态 |

## 合集路由

### `/zykj/collection/news` — 新闻动态合集
学校要闻、科研聚焦、教学动态、基层风采、媒体关注的合集，按发布日期降序排列。

### `/zykj/collection/notice` — 通知公告合集
学院通知公告 + 各书院、学院、党政机构通知公告的合集，按发布日期降序排列。

## 使用示例

```
# 订阅学校要闻
https://rsshub.app/zykj/news/xxyw

# 订阅立心书院通知公告
https://rsshub.app/zykj/notice/lxsy

# 订阅新闻动态合集
https://rsshub.app/zykj/collection/news

# 订阅通知公告合集
https://rsshub.app/zykj/collection/notice

# 限制条目数（默认 20/50/100）
https://rsshub.app/zykj/news/xxyw?limit=10
```

## 部署

将 `zykj/` 目录复制到 RSSHub 的 `lib/routes/` 目录下即可自动加载。

```bash
cp -r zykj/ /path/to/RSSHub/lib/routes/
```
