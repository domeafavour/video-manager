# Video Manager（中文）

用于按项目管理视频相关资源的桌面应用。

基于 Electron + Vite + React，数据本地存储在 IndexedDB。

## 主要功能

- 项目管理
  - 创建、更新、删除项目
  - 进入项目详情时自动打开对应项目标签页
  - 应用启动时恢复上次激活的项目路由
- 资源管理
  - 通过文件选择器或拖拽添加资源
  - 按项目管理资源
  - 删除资源，并可选删除本地原文件
  - 将资源状态标记为 `used` 或 `unused`
  - 编辑资源标签，并按标签/状态筛选
  - 多选资源并将选中资源拖拽导出到应用外
- 项目列表体验
  - 网格/列表视图切换
  - 按标题、描述、标签搜索项目
  - 直接通过拖拽文件创建新项目
- 桌面集成（IPC）
  - 打开系统文件选择器
  - 在 Finder 中定位文件
  - 从磁盘删除本地文件
  - 通过 `webContents.startDrag` 支持原生拖拽导出

## 技术栈

- Electron 30
- Vite 5
- React 18 + TypeScript 5
- TanStack Router + React Query
- Zustand
- IndexedDB（idb）
- Tailwind CSS 4 + Radix UI

## 项目结构

```text
electron/
	main.ts        # Electron 主进程与 IPC 处理
	preload.ts     # 渲染进程上下文桥接
src/
	routes/        # 文件路由
	features/
		project-list/
		project-detail/
	services/      # 查询与变更服务层
	lib/db.ts      # IndexedDB 数据访问
	stores/        # 持久化 UI/会话状态
```

## 数据模型

- ProjectEntity
  - id, createdAt, updatedAt
  - title, description, resourcesCount, tags
- MaterialEntity
  - id, createdAt, updatedAt
  - projectId, name, path, size, alias, status, tags

说明：

- 数据存储在 IndexedDB，数据库名为 video-manager-db。
- 当前数据库 schema 版本为 3。
- v3 迁移会为缺失 status 的资源回填 unused。

## 开发

安装依赖：

```bash
pnpm install
```

启动开发模式：

```bash
pnpm dev
```

构建应用：

```bash
pnpm build
```

代码检查：

```bash
pnpm lint
```

预览渲染端构建产物：

```bash
pnpm preview
```

## 路由

- /：项目列表
- /projects/：项目列表
- /projects/$id：项目详情

根布局包含已打开项目的顶部标签栏，并按路由渲染页面内容。

## 备注

- 已打开项目标签、列表视图偏好、搜索关键字等应用状态通过 Zustand 持久化。
- 查询失效策略基于 React Query 自定义元数据中的标签机制（见 src/queryClient.ts）。
