# Mini Program Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first WeChat mini program framework for the shared menu MVP.

**Architecture:** Use native WeChat Mini Program pages with a thin service layer. Keep core menu summary logic in a pure CommonJS utility so it can be tested with Node and reused by cloud functions.

**Tech Stack:** WeChat Mini Program native WXML/WXSS/JS, WeChat CloudBase cloud functions, Node.js built-in test runner.

---

### Task 1: Core Summary Logic

**Files:**
- Create: `tests/summary.test.js`
- Create: `miniprogram/utils/summary.js`

- [x] Write tests for limited-quantity allocation by entry creation time.
- [x] Write tests for dish merging and original/final totals.
- [x] Run `node --test tests/summary.test.js` and verify failure before implementation.
- [x] Implement `allocateEntries` and `buildMenuSummary`.
- [x] Run `node --test tests/summary.test.js` and verify pass.

### Task 2: Mini Program Shell

**Files:**
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`

- [x] Configure mini program root and cloud function root.
- [x] Register MVP pages.
- [x] Add global layout, card, button, input, and tag styles.

### Task 3: Mock Service Layer

**Files:**
- Create: `miniprogram/services/mock.js`
- Create: `miniprogram/services/api.js`
- Create: `miniprogram/utils/status.js`

- [x] Add mock users, spaces, members, dishes, menu sessions, entries, confirmations, orders, and versions.
- [x] Add service methods for all page reads.
- [x] Wire menu detail reads to `buildMenuSummary`.

### Task 4: MVP Pages

**Files:**
- Create page folders under `miniprogram/pages/`.

- [x] Add login and space list pages.
- [x] Add space home and member management pages.
- [x] Add dish list and dish edit pages.
- [x] Add menu session list, detail, chef confirmation, and order detail pages.

### Task 5: Cloud Function Boundaries

**Files:**
- Create function folders under `cloudfunctions/`.

- [x] Add function directories matching the design API list.
- [x] Implement `login` with `wx-server-sdk`.
- [x] Implement `calculateMenuSummary` with a local copy of the pure summary module.
- [x] Keep write functions as explicit `NOT_CONNECTED` boundaries until CloudBase collections are configured.

### Task 6: Verification

**Files:**
- Create: `README.md`
- Create: `cloudfunctions/README.md`

- [x] Document how to open the project in WeChat Developer Tools.
- [x] Document mock mode and CloudBase switch-over.
- [x] Run `npm test`.
- [x] Run JS syntax checks.
