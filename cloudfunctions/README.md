# 云函数边界

当前云函数目录按设计文档中的 API 清单创建：

- `login`
- `createSpace`
- `joinSpace`
- `updateMemberRole`
- `createDish`
- `updateDish`
- `createMenuSession`
- `addDishToMenu`
- `updateMyMenuItemQuantity`
- `submitMenuSession`
- `confirmDishAvailability`
- `calculateMenuSummary`

当前小程序真实模式默认调用统一云函数：

- `appApi`

`appApi` 已实现登录、空间、成员、菜品、点单局、点单记录、厨师确认、订单版本和查询接口。其余按 API 名称拆分的函数目录保留为早期边界，后续可以继续拆分，也可以保持统一入口。

真实接入 CloudBase 时，每个写函数都应先做三类校验：

- 当前用户是否已登录。
- 当前用户是否属于对应 `space_id`。
- 当前用户角色是否满足操作要求，例如 owner 才能改成员角色，chef 或 owner 才能修改厨师确认。
