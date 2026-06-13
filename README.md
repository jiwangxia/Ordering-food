# 多人共享菜单微信小程序

这是一个基于原生微信小程序和微信云开发的项目骨架，按 `docs/design/shared-menu-mini-program.md` 中的 MVP 流程搭建。

## 当前包含

- 小程序基础配置：`project.config.json`、`miniprogram/app.json`、全局样式。
- 页面骨架：登录、空间列表、空间首页、菜品库、菜品编辑、点单局列表、点单详情、厨师确认、订单详情、成员管理。
- 本地 mock 服务层：`miniprogram/services/api.js` 和 `miniprogram/services/mock.js`。
- 核心计算模块：`miniprogram/utils/summary.js`，包含同菜合并、少货按时间分配、原始和最终金额汇总。
- 云函数边界：按设计文档的 API 名称创建目录，后续可逐个接入 CloudBase 数据库。
- 自动化测试：`tests/summary.test.js` 覆盖少货分配和菜单汇总规则。

## 本地验证

```bash
npm test
```

## 在线预览

GitHub Pages 会将 `preview` 目录部署为长期预览页：

```text
https://jiwangxia.github.io/Ordering-food/
```

## 微信开发者工具打开方式

1. 打开微信开发者工具。
2. 导入当前目录 `D:\VS\CD`。
3. AppID 可先使用测试号或替换 `project.config.json` 中的 `appid`。
4. 当前 `miniprogram/app.js` 中 `globalData.useMock` 为 `true`，页面会使用本地 mock 数据展示主流程。
5. 接入真实云开发后，填写 `globalData.envId`，并将 `useMock` 改为 `false`。

## 下一步建议

1. 开通微信云开发环境。
2. 按 [云开发接入说明](docs/cloudbase-setup.md) 创建集合并上传 `appApi` 云函数。
3. 将 `miniprogram/app.js` 中的 `envId` 填好，并把 `useMock` 改为 `false`。
4. 在微信开发者工具里联调真实登录、空间、菜品、点单和厨师确认流程。
