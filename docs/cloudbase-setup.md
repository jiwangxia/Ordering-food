# 微信云开发接入说明

当前代码已经保留 mock 模式，并实现了真实云开发模式所需的统一云函数 `appApi`。

## 1. 开通云开发后填写环境 ID

打开 `miniprogram/app.js`：

```js
globalData: {
  envId: '',
  useMock: true,
}
```

改成：

```js
globalData: {
  envId: '你的云开发环境 ID',
  useMock: false,
}
```

## 2. 创建数据库集合

在微信开发者工具的云开发控制台创建这些集合：

```text
users
spaces
space_members
dishes
menu_sessions
menu_item_entries
chef_confirmations
orders
order_versions
notifications
```

## 3. 上传云函数

优先上传这个统一云函数：

```text
cloudfunctions/appApi
```

它包含登录、空间、成员、菜品、点单局、点单记录、厨师确认和订单版本的真实数据库逻辑。

保留的其他云函数目录是早期按 API 名称拆出的边界，目前小程序真实模式默认调用 `appApi`。

## 4. 当前已接入真实云函数的能力

- 登录时创建或更新 `users`
- 创建空间并自动创建 owner 成员记录
- 使用邀请码加入空间
- owner 修改成员角色
- 创建菜品
- 更新菜品
- 创建点单局
- 从菜品库加入点单局
- 修改自己的点单份数
- 提交点单局并生成 `orders` 和 `order_versions`
- chef/owner 保存厨师确认
- 查询空间、成员、菜品、点单局、点单详情、订单详情

## 5. 仍需真机联调的部分

- 微信头像昵称授权策略。
- 云存储图片上传权限。
- 数据库权限规则。
- 真实多人同时操作时的冲突处理。
- 微信订阅消息。

第一版建议先用云函数做所有写操作，数据库集合权限可以先设置为“仅创建者可读写”之外的自定义规则，最终以云函数权限校验为准。
