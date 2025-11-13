# 測試文檔 (Testing Documentation)

本專案使用 Playwright 進行端對端（E2E）測試，涵蓋系統功能和UI顯示測試。

## 測試架構

### 測試文件結構
```
tests/
├── helpers.js              # 測試輔助函數
├── auth.spec.js           # 認證功能測試
├── bookmarks.spec.js      # 書籤CRUD功能測試
├── ui-display.spec.js     # UI顯示和交互測試
├── filters-search.spec.js # 過濾和搜索功能測試
└── import-export.spec.js  # 導入導出和批量操作測試
```

## 測試覆蓋範圍

### 1. 認證測試 (auth.spec.js)
- ✅ 登錄頁面顯示
- ✅ 註冊頁面顯示
- ✅ 未認證用戶重定向
- ✅ 表單驗證
- ✅ 錯誤處理
- ✅ 頁面導航

### 2. 書籤功能測試 (bookmarks.spec.js)
- ✅ 新增書籤
- ✅ 編輯書籤
- ✅ 刪除書籤
- ✅ 更改書籤狀態
- ✅ 設置優先級
- ✅ 添加標籤
- ✅ 顯示書籤列表

### 3. UI顯示測試 (ui-display.spec.js)
- ✅ 頁面頭部導航
- ✅ 用戶菜單
- ✅ 深色/淺色主題切換
- ✅ 搜索欄顯示
- ✅ 狀態過濾按鈕
- ✅ 排序下拉選單
- ✅ 書籤卡片顯示
- ✅ Toast 通知
- ✅ 響應式設計（手機視圖）
- ✅ 加載狀態

### 4. 過濾和搜索測試 (filters-search.spec.js)
- ✅ 按標題搜索
- ✅ 按URL搜索
- ✅ 按筆記搜索
- ✅ 狀態過濾（全部/未讀/閱讀中/已完成）
- ✅ 標籤過濾
- ✅ 排序功能
- ✅ 組合過濾
- ✅ 搜索結果計數
- ✅ 空狀態顯示

### 5. 導入導出測試 (import-export.spec.js)
- ✅ 導出為 JSON
- ✅ 導出為 CSV
- ✅ 導入按鈕顯示
- ✅ 全部標記為已讀
- ✅ 清除已完成書籤
- ✅ 批量操作按鈕
- ✅ 確認對話框

## 本地運行測試

### 前置要求
1. Node.js 18 或更高版本
2. 已安裝專案依賴：`npm install`
3. 已配置 Supabase 環境變量（`.env` 文件）

### 安裝測試依賴
```bash
npm install
npx playwright install chromium
```

### 運行測試

#### 運行所有測試（無頭模式）
```bash
npm test
```

#### 運行測試並顯示瀏覽器
```bash
npm run test:headed
```

#### 使用 Playwright UI 模式
```bash
npm run test:ui
```

#### 調試模式
```bash
npm run test:debug
```

#### 查看測試報告
```bash
npm run test:report
```

#### 運行特定測試文件
```bash
npx playwright test tests/auth.spec.js
npx playwright test tests/bookmarks.spec.js
```

#### 運行特定測試用例
```bash
npx playwright test -g "should add a new bookmark"
```

## CI/CD 集成

測試會在以下情況自動運行：
- 推送到 `main`、`master`、`develop` 或 `claude/**` 分支
- 創建或更新 Pull Request

### GitHub Actions 工作流

工作流文件：`.github/workflows/test.yml`

功能：
- ✅ 自動安裝依賴
- ✅ 運行所有 Playwright 測試
- ✅ 生成測試報告
- ✅ 上傳測試報告（保留30天）
- ✅ 失敗時上傳截圖（保留7天）
- ✅ 在 PR 中評論測試結果

### 設置 GitHub Secrets（必需）

為了讓 CI/CD 測試正常運行，需要在 GitHub 儲存庫中設置以下 Secrets：

1. 前往 GitHub 儲存庫的 **Settings** > **Secrets and variables** > **Actions**
2. 點擊 **New repository secret**
3. 添加以下 secrets：

| Secret 名稱 | 說明 | 範例值 |
|------------|------|--------|
| `VITE_SUPABASE_URL` | Supabase 項目 URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密鑰 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**獲取 Supabase 憑證：**
1. 登錄 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的項目
3. 前往 **Settings** > **API**
4. 複製 **Project URL** 和 **anon/public** key

**注意：**
- 如果不設置這些 secrets，工作流會使用佔位符值，測試可能會失敗
- 建議為 CI 環境創建單獨的測試用 Supabase 項目
- 永遠不要將真實的 Supabase 密鑰提交到代碼倉庫

### 查看 CI 測試結果

1. 前往 GitHub Actions 標籤
2. 選擇最新的工作流運行
3. 查看 "Run E2E Tests" 作業
4. 下載測試報告和截圖（如果失敗）

## 測試配置

### Playwright 配置 (playwright.config.js)

- **測試目錄**: `./tests`
- **基礎 URL**: `http://localhost:5173`
- **瀏覽器**: Chromium
- **重試次數**: CI 環境重試 2 次
- **Workers**: CI 環境使用 1 個 worker
- **報告**: HTML 報告、列表報告、GitHub 報告（CI）
- **追蹤**: 失敗時重試時記錄
- **截圖**: 失敗時截圖
- **錄影**: 失敗時保留

## 測試最佳實踐

### 1. 使用測試輔助函數
```javascript
import { generateTestUser, login, addBookmark } from './helpers.js'

test('example', async ({ page }) => {
  const user = generateTestUser()
  await login(page, user.email, user.password)
  await addBookmark(page, 'https://example.com', 'Example')
})
```

### 2. 等待元素出現
```javascript
await expect(page.locator('text=Bookmark added')).toBeVisible()
```

### 3. 處理確認對話框
```javascript
page.on('dialog', dialog => dialog.accept())
await page.click('button:has-text("Delete")')
```

### 4. 使用靈活的選擇器
```javascript
// 使用多個可能的選擇器
const button = page.locator('[data-testid="add-button"], button:has-text("Add")')
```

## 添加新測試

1. 在 `tests/` 目錄下創建新的 `.spec.js` 文件
2. 導入必要的測試工具和輔助函數
3. 使用 `test.describe` 分組相關測試
4. 使用 `test.beforeEach` 設置測試環境
5. 編寫清晰的測試用例

範例：
```javascript
import { test, expect } from '@playwright/test'
import { generateTestUser, login } from './helpers.js'

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser()
    await login(page, user.email, user.password)
  })

  test('should do something', async ({ page }) => {
    // 測試邏輯
    await expect(page.locator('...')).toBeVisible()
  })
})
```

## 改進測試可靠性

為了提高測試的可靠性和可維護性，建議在組件中添加 `data-testid` 屬性：

```jsx
// 範例
<button data-testid="add-bookmark-button">Add</button>
<div data-testid="bookmark-card">{bookmark.title}</div>
```

這樣可以使用更穩定的選擇器：
```javascript
await page.click('[data-testid="add-bookmark-button"]')
```

## 故障排除

### 測試超時
- 增加 `test.setTimeout()` 或在 `playwright.config.js` 中調整全局超時
- 檢查是否有網絡請求過慢

### 元素未找到
- 使用 `await page.waitForSelector()` 等待元素加載
- 檢查選擇器是否正確
- 使用 Playwright Inspector: `npm run test:debug`

### Supabase 連接問題
- 確認 `.env` 文件配置正確
- 檢查 Supabase 項目是否運行
- 驗證 API 密鑰是否有效

## 資源

- [Playwright 文檔](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)

## 貢獻

添加新功能時，請確保：
1. 為新功能編寫測試
2. 所有測試通過
3. 測試覆蓋主要用例和邊界情況
4. 更新此文檔
