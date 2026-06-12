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

除 `login` 和 `calculateMenuSummary` 外，其余函数目前返回 `NOT_CONNECTED`，用于明确后端边界并避免前端误以为写操作已经落库。

真实接入 CloudBase 时，每个写函数都应先做三类校验：

- 当前用户是否已登录。
- 当前用户是否属于对应 `space_id`。
- 当前用户角色是否满足操作要求，例如 owner 才能改成员角色，chef 或 owner 才能修改厨师确认。
