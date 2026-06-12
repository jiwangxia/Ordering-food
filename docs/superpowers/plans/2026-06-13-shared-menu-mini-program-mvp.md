# 多人共享菜单微信小程序 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable WeChat Mini Program MVP for multi-space shared menu ordering with virtual pricing, chef confirmation, shortage allocation, and final summaries.

**Architecture:** Use native WeChat Mini Program pages for the client and WeChat CloudBase for database, cloud functions, file storage, and user identity. Keep core business rules in shared cloud function modules so shortage allocation, permission checks, and summary calculation are tested independently from page UI.

**Tech Stack:** WeChat Mini Program native framework, JavaScript, WeChat CloudBase database, CloudBase cloud functions, CloudBase cloud storage, Jest for local business-rule tests where possible.

---

## File Structure

Create this project layout:

```text
miniprogram/
  app.js
  app.json
  app.wxss
  sitemap.json
  pages/
    login/
      index.js
      index.json
      index.wxml
      index.wxss
    spaces/
      index.js
      index.json
      index.wxml
      index.wxss
    space-home/
      index.js
      index.json
      index.wxml
      index.wxss
    members/
      index.js
      index.json
      index.wxml
      index.wxss
    dishes/
      index.js
      index.json
      index.wxml
      index.wxss
    dish-edit/
      index.js
      index.json
      index.wxml
      index.wxss
    menu-sessions/
      index.js
      index.json
      index.wxml
      index.wxss
    menu-detail/
      index.js
      index.json
      index.wxml
      index.wxss
    chef-confirm/
      index.js
      index.json
      index.wxml
      index.wxss
    order-detail/
      index.js
      index.json
      index.wxml
      index.wxss
  components/
    dish-card/
      index.js
      index.json
      index.wxml
      index.wxss
    menu-dish-row/
      index.js
      index.json
      index.wxml
      index.wxss
    summary-panel/
      index.js
      index.json
      index.wxml
      index.wxss
  utils/
    cloud.js
    format.js
    route.js
cloudfunctions/
  common/
    package.json
    index.js
    auth.js
    allocation.js
    summary.js
    validation.js
  login/
    package.json
    index.js
  space/
    package.json
    index.js
  dish/
    package.json
    index.js
  menu/
    package.json
    index.js
  chef/
    package.json
    index.js
  order/
    package.json
    index.js
  notification/
    package.json
    index.js
tests/
  allocation.test.js
  summary.test.js
  permissions.test.js
docs/
  design/
    shared-menu-mini-program.md
  superpowers/
    plans/
      2026-06-13-shared-menu-mini-program-mvp.md
```

## Database Collections

Create these CloudBase collections:

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

Each document must include `created_at` and `updated_at` when it is mutable. All space-scoped collections must include `space_id`.

## Task 1: Project Bootstrap

**Files:**

- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`
- Create: `miniprogram/utils/cloud.js`
- Create: `cloudfunctions/common/package.json`
- Create: `cloudfunctions/common/index.js`
- Create: `package.json`

- [ ] **Step 1: Initialize WeChat Mini Program in Developer Tools**

Create a native WeChat Mini Program project with CloudBase enabled. Use `miniprogram/` as the mini program root and `cloudfunctions/` as the cloud functions root.

- [ ] **Step 2: Configure app routes**

Add all MVP page routes to `miniprogram/app.json`:

```json
{
  "pages": [
    "pages/login/index",
    "pages/spaces/index",
    "pages/space-home/index",
    "pages/members/index",
    "pages/dishes/index",
    "pages/dish-edit/index",
    "pages/menu-sessions/index",
    "pages/menu-detail/index",
    "pages/chef-confirm/index",
    "pages/order-detail/index"
  ],
  "window": {
    "navigationBarTitleText": "共享菜单",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f6f7f9"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 3: Add CloudBase helper**

Create `miniprogram/utils/cloud.js` with wrappers for `wx.cloud.callFunction`, `wx.cloud.uploadFile`, and consistent error messages.

- [ ] **Step 4: Add local test setup**

Create `package.json` with Jest:

```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

- [ ] **Step 5: Verify bootstrap**

Run:

```bash
npm install
npm test
```

Expected result: Jest runs and reports no tests found or passes once tests are added.

## Task 2: Core Business Rule Tests

**Files:**

- Create: `cloudfunctions/common/allocation.js`
- Create: `cloudfunctions/common/summary.js`
- Create: `tests/allocation.test.js`
- Create: `tests/summary.test.js`

- [ ] **Step 1: Write allocation tests**

Cover these cases in `tests/allocation.test.js`:

```text
A adds 2, B adds 1, available 1 -> A effective 1, B effective 0
A adds 2, B adds 1, available 2 -> A effective 2, B effective 0
A adds 1, B adds 2, available 2 -> A effective 1, B effective 1
available 0 -> everyone effective 0
available greater than requested -> everyone keeps original quantity
```

- [ ] **Step 2: Implement `allocateByCreatedAt`**

Create `cloudfunctions/common/allocation.js` exporting:

```js
function allocateByCreatedAt(entries, availableQuantity) {
  const sorted = [...entries].sort((a, b) => {
    const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (timeDiff !== 0) return timeDiff;
    return String(a._id || '').localeCompare(String(b._id || ''));
  });

  let remaining = Math.max(0, Number(availableQuantity || 0));
  const byUser = {};
  const byEntry = {};

  for (const entry of sorted) {
    const quantity = Math.max(0, Number(entry.quantity || 0));
    const effectiveQuantity = Math.min(quantity, remaining);
    remaining -= effectiveQuantity;
    byEntry[entry._id] = effectiveQuantity;
    byUser[entry.user_id] = (byUser[entry.user_id] || 0) + effectiveQuantity;
  }

  return { byUser, byEntry };
}

module.exports = { allocateByCreatedAt };
```

- [ ] **Step 3: Write summary tests**

Cover original totals and final effective totals across two dishes with different prices.

- [ ] **Step 4: Implement `calculateMenuSummary`**

Create `cloudfunctions/common/summary.js` exporting a pure function that accepts dishes, entries, confirmations, and users, then returns:

```js
{
  original: {
    totalQuantity,
    totalAmount,
    byUser
  },
  final: {
    totalQuantity,
    totalAmount,
    byUser
  },
  dishRows
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test
```

Expected result: allocation and summary tests pass.

## Task 3: Login And User Profile

**Files:**

- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/login/package.json`
- Create: `miniprogram/pages/login/index.js`
- Create: `miniprogram/pages/login/index.wxml`
- Create: `miniprogram/pages/login/index.wxss`
- Modify: `miniprogram/app.js`

- [ ] **Step 1: Implement login cloud function**

Use `cloud.getWXContext()` to read `OPENID`. Upsert a `users` record with `openid`, `nickname`, `avatar_url`, `created_at`, and `updated_at`.

- [ ] **Step 2: Build login page**

The page should request the user's nickname/avatar where supported, call `login`, store `user_id` and `openid` in local storage, then navigate to `/pages/spaces/index`.

- [ ] **Step 3: Verify login**

Run in WeChat Developer Tools:

```text
Open mini program -> login page -> authorize -> spaces page
```

Expected result: `users` collection contains exactly one document for the current openid.

## Task 4: Spaces And Members

**Files:**

- Create: `cloudfunctions/space/index.js`
- Create: `cloudfunctions/space/package.json`
- Create: `miniprogram/pages/spaces/index.js`
- Create: `miniprogram/pages/spaces/index.wxml`
- Create: `miniprogram/pages/spaces/index.wxss`
- Create: `miniprogram/pages/space-home/index.js`
- Create: `miniprogram/pages/space-home/index.wxml`
- Create: `miniprogram/pages/space-home/index.wxss`
- Create: `miniprogram/pages/members/index.js`
- Create: `miniprogram/pages/members/index.wxml`
- Create: `miniprogram/pages/members/index.wxss`
- Create: `tests/permissions.test.js`

- [ ] **Step 1: Implement permission helpers**

In `cloudfunctions/common/auth.js`, implement:

```text
getCurrentUser(openid)
assertSpaceMember(space_id, user_id)
assertSpaceOwner(space_id, user_id)
assertChefOrOwner(space_id, user_id)
```

- [ ] **Step 2: Implement space actions**

`cloudfunctions/space/index.js` should support:

```text
createSpace
joinSpace
listMySpaces
getSpaceHome
listMembers
updateMemberRole
```

- [ ] **Step 3: Build spaces page**

The spaces page should list joined spaces, create a new space, and join via invite code.

- [ ] **Step 4: Build space home**

Show entries for dishes, menu sessions, members, and historical orders.

- [ ] **Step 5: Build member management**

Owner can change a member role to `member` or `chef`. Owner cannot demote themselves in MVP.

- [ ] **Step 6: Verify spaces**

Expected results:

```text
User can create a space and becomes owner.
Invite code lets another user join as member.
Owner can set member as chef.
Non-owner cannot update roles.
```

## Task 5: Dish Library

**Files:**

- Create: `cloudfunctions/dish/index.js`
- Create: `cloudfunctions/dish/package.json`
- Create: `miniprogram/pages/dishes/index.js`
- Create: `miniprogram/pages/dishes/index.wxml`
- Create: `miniprogram/pages/dishes/index.wxss`
- Create: `miniprogram/pages/dish-edit/index.js`
- Create: `miniprogram/pages/dish-edit/index.wxml`
- Create: `miniprogram/pages/dish-edit/index.wxss`
- Create: `miniprogram/components/dish-card/index.js`
- Create: `miniprogram/components/dish-card/index.wxml`
- Create: `miniprogram/components/dish-card/index.wxss`
- Create: `miniprogram/components/dish-card/index.json`

- [ ] **Step 1: Implement dish actions**

`cloudfunctions/dish/index.js` should support:

```text
createDish
updateDish
listDishes
getDish
disableDish
```

- [ ] **Step 2: Add image upload**

Use `wx.cloud.uploadFile` to upload dish images to:

```text
dishes/{space_id}/{timestamp}-{random}.jpg
```

- [ ] **Step 3: Build dish list**

Show dish image, name, price, ingredients preview, creator, and active state.

- [ ] **Step 4: Build dish edit page**

Validate:

```text
name is required
price must be a non-negative number
image is optional in MVP
ingredients and description can be empty
```

- [ ] **Step 5: Verify dish library**

Expected results:

```text
Any space member can create dishes.
Uploader can edit their own dishes.
Non-uploader cannot edit another user's dish in MVP.
Disabled dishes no longer appear in normal selection.
```

## Task 6: Menu Sessions And Shared Ordering

**Files:**

- Create: `cloudfunctions/menu/index.js`
- Create: `cloudfunctions/menu/package.json`
- Create: `miniprogram/pages/menu-sessions/index.js`
- Create: `miniprogram/pages/menu-sessions/index.wxml`
- Create: `miniprogram/pages/menu-sessions/index.wxss`
- Create: `miniprogram/pages/menu-detail/index.js`
- Create: `miniprogram/pages/menu-detail/index.wxml`
- Create: `miniprogram/pages/menu-detail/index.wxss`
- Create: `miniprogram/components/menu-dish-row/index.js`
- Create: `miniprogram/components/menu-dish-row/index.wxml`
- Create: `miniprogram/components/menu-dish-row/index.wxss`
- Create: `miniprogram/components/menu-dish-row/index.json`
- Create: `miniprogram/components/summary-panel/index.js`
- Create: `miniprogram/components/summary-panel/index.wxml`
- Create: `miniprogram/components/summary-panel/index.wxss`
- Create: `miniprogram/components/summary-panel/index.json`

- [ ] **Step 1: Implement menu actions**

`cloudfunctions/menu/index.js` should support:

```text
createMenuSession
listMenuSessions
getMenuDetail
addDishToMenu
updateMyMenuItemQuantity
deleteMyMenuItemEntries
submitMenuSession
```

- [ ] **Step 2: Store entries by batch**

Each add action creates or updates entries in `menu_item_entries`. Reducing quantity removes from the current user's newest entries first, keeping audit-friendly history with `is_deleted` where needed.

- [ ] **Step 3: Build menu session list**

Show multiple active point-ordering sessions in the same space.

- [ ] **Step 4: Build menu detail page**

Display:

```text
dish name
total original quantity
price per serving
user quantity text such as A x2, B x1
chef confirmation status
final allocation text such as A x1, B x0 when partial
original summary
final summary
```

- [ ] **Step 5: Enforce edit permissions**

Current user can only increase, decrease, or remove their own entries. Chef and owner still do not modify other users' original entries in MVP.

- [ ] **Step 6: Verify shared ordering**

Expected results:

```text
Multiple users can add the same dish.
The UI shows one merged row per dish.
The UI shows per-user quantities under the dish.
Only the current user's quantity controls are editable.
Submitting creates an order version.
```

## Task 7: Chef Confirmation

**Files:**

- Create: `cloudfunctions/chef/index.js`
- Create: `cloudfunctions/chef/package.json`
- Create: `miniprogram/pages/chef-confirm/index.js`
- Create: `miniprogram/pages/chef-confirm/index.wxml`
- Create: `miniprogram/pages/chef-confirm/index.wxss`

- [ ] **Step 1: Implement chef confirmation actions**

`cloudfunctions/chef/index.js` should support:

```text
listConfirmableDishes
confirmDishAvailability
confirmMenuComplete
```

- [ ] **Step 2: Validate chef inputs**

Rules:

```text
available -> available_quantity equals original dish total
partial -> available_quantity must be >= 0 and < original dish total
unavailable -> available_quantity equals 0
```

- [ ] **Step 3: Build chef confirmation page**

For each dish, show original requested quantity and controls for:

```text
可做
只能做 N 份
无货
备注
```

- [ ] **Step 4: Recalculate final summary after confirmation**

After saving confirmation, call summary calculation and refresh menu detail.

- [ ] **Step 5: Verify chef flow**

Expected results:

```text
Chef can mark dish available.
Chef can mark dish partial and set available quantity.
Chef can mark dish unavailable.
Member cannot access confirmation mutation.
Final summary updates after confirmation.
```

## Task 8: Orders And Versions

**Files:**

- Create: `cloudfunctions/order/index.js`
- Create: `cloudfunctions/order/package.json`
- Create: `miniprogram/pages/order-detail/index.js`
- Create: `miniprogram/pages/order-detail/index.wxml`
- Create: `miniprogram/pages/order-detail/index.wxss`

- [ ] **Step 1: Implement order actions**

`cloudfunctions/order/index.js` should support:

```text
getOrderDetail
listSpaceOrders
listOrderVersions
closeOrder
```

- [ ] **Step 2: Save order snapshots**

Every `submitMenuSession` call should create a new `order_versions` document with:

```text
version_no
dish snapshots
original per-user quantities
chef confirmations
final allocations
original summary
final summary
created_by
created_at
```

- [ ] **Step 3: Build order detail page**

Show latest version first and allow switching to earlier versions.

- [ ] **Step 4: Verify versioning**

Expected results:

```text
First submit creates version 1.
After menu changes, submit creates version 2.
Historical version 1 remains unchanged even if dish price changes later.
```

## Task 9: In-App Notifications

**Files:**

- Create: `cloudfunctions/notification/index.js`
- Create: `cloudfunctions/notification/package.json`
- Modify: `cloudfunctions/menu/index.js`
- Modify: `cloudfunctions/chef/index.js`
- Modify: `miniprogram/pages/space-home/index.js`
- Modify: `miniprogram/pages/menu-sessions/index.js`

- [ ] **Step 1: Implement notification actions**

`cloudfunctions/notification/index.js` should support:

```text
listNotifications
markNotificationRead
createSpaceNotifications
```

- [ ] **Step 2: Create notifications on submit**

When a menu session is submitted or resubmitted, notify space members that the menu changed.

- [ ] **Step 3: Create notifications on chef confirmation**

When chef confirmation is completed, notify space members that final results are ready.

- [ ] **Step 4: Show unread indicators**

Show unread count or red dot on space home and menu session list.

- [ ] **Step 5: Verify notifications**

Expected results:

```text
Submitting a menu creates notifications for other space members.
Chef confirmation creates notifications for members.
Opening related menu marks notifications read.
```

## Task 10: MVP Polish And Manual Acceptance

**Files:**

- Modify: `miniprogram/app.wxss`
- Modify: all page `.wxss` files as needed
- Modify: `docs/design/shared-menu-mini-program.md` if implementation decisions change

- [ ] **Step 1: Apply consistent visual style**

Use a clean utility style:

```text
white background cards
8px radius
clear spacing
primary action buttons
secondary text for descriptions
red/amber status color for unavailable/partial states
```

- [ ] **Step 2: Add empty states**

Add empty states for:

```text
no spaces
no dishes
no menu sessions
empty menu
no orders
no notifications
```

- [ ] **Step 3: Add loading and error states**

Every page that calls cloud functions should show loading feedback and a user-readable error when the call fails.

- [ ] **Step 4: Run full manual scenario**

Use two test users in WeChat Developer Tools if available:

```text
User A creates a space.
User A invites User B.
User A sets User B as chef.
User A uploads 番茄炒蛋 price 12.
User B uploads 可乐鸡翅 price 20.
User A creates 周六晚饭.
User A adds 可乐鸡翅 x2.
User B adds 可乐鸡翅 x1.
User A submits.
User B as chef confirms 可乐鸡翅 only x1.
System shows final allocation A x1, B x0.
Final summary uses effective quantities.
User B adds 番茄炒蛋 x1.
User A resubmits.
System creates version 2.
```

- [ ] **Step 5: Commit MVP**

Commit after the full scenario passes:

```bash
git add miniprogram cloudfunctions tests docs
git commit -m "feat: build shared menu mini program mvp"
```

## Test Strategy

Automated tests:

- `tests/allocation.test.js` verifies shortage allocation.
- `tests/summary.test.js` verifies original and final summary calculation.
- `tests/permissions.test.js` verifies role checks in pure helper functions.

Manual tests:

- WeChat login.
- Space creation and joining.
- Role assignment.
- Dish upload with image.
- Multi-user shared ordering.
- Chef confirmation.
- Shortage allocation.
- Order versioning.
- In-app notifications.

## Implementation Milestones

Milestone 1:

- Project bootstrap.
- Login.
- Spaces.
- Members.

Milestone 2:

- Dish library.
- Menu sessions.
- Shared ordering.

Milestone 3:

- Chef confirmation.
- Shortage allocation.
- Final summary.

Milestone 4:

- Orders.
- Versions.
- In-app notifications.
- MVP polish.

## Out Of Scope For MVP

- WeChat Pay.
- External delivery.
- Web admin dashboard.
- Public marketplace.
- Complex financial settlement.
- WeChat subscription message push.
- Dish rating and ranking.
- AI-generated recipes.
