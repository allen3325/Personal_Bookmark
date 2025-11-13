# GitHub Actions CI/CD 設置指南

## 問題
如果你在 GitHub Actions 中看到以下錯誤：
```
Error: Timed out waiting 120000ms from config.webServer.
```

這是因為 Vite 開發服務器需要環境變量才能啟動，但 CI 環境中沒有這些變量。

## 解決方案

### 步驟 1: 設置 GitHub Secrets

1. 前往你的 GitHub 儲存庫
2. 點擊 **Settings** 標籤
3. 在左側菜單中選擇 **Secrets and variables** > **Actions**
4. 點擊 **New repository secret** 按鈕
5. 添加以下兩個 secrets：

#### Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Secret**: 你的 Supabase 項目 URL（例如：`https://xxxxx.supabase.co`）

#### Secret 2: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Secret**: 你的 Supabase 匿名密鑰（例如：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）

### 步驟 2: 獲取 Supabase 憑證

1. 登錄 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的項目
3. 點擊左側的 **Settings** 圖標
4. 選擇 **API**
5. 找到以下信息：
   - **Project URL** → 用於 `VITE_SUPABASE_URL`
   - **anon public** key → 用於 `VITE_SUPABASE_ANON_KEY`

### 步驟 3: 驗證設置

1. 添加 secrets 後，重新運行失敗的 workflow
2. 前往 **Actions** 標籤
3. 選擇失敗的 workflow
4. 點擊 **Re-run jobs** > **Re-run all jobs**

## 最佳實踐

### 選項 1: 使用現有的 Supabase 項目
- 優點：設置簡單
- 缺點：測試會使用生產數據庫

### 選項 2: 創建專用的測試 Supabase 項目（推薦）
1. 在 Supabase 中創建新項目（例如：`personal-bookmark-test`）
2. 運行相同的數據庫遷移
3. 使用測試項目的憑證作為 GitHub Secrets
4. 這樣測試不會影響生產數據

## 工作流說明

更新後的 `.github/workflows/test.yml` 會：
1. 自動檢查 GitHub Secrets
2. 如果 secrets 存在，使用真實值
3. 如果 secrets 不存在，使用佔位符值（允許工作流啟動，但測試可能失敗）
4. 創建 `.env` 文件供 Vite 使用

## 故障排除

### 測試仍然失敗？
- 確認 secrets 名稱完全匹配（區分大小寫）
- 確認 Supabase URL 格式正確（包含 `https://`）
- 確認 Supabase 項目處於活動狀態
- 檢查 Supabase API 密鑰是否有效

### 如何查看詳細錯誤？
1. 前往 GitHub Actions 運行頁面
2. 點擊失敗的作業
3. 展開 "Run Playwright tests" 步驟
4. 查看詳細的錯誤日誌

### 本地測試通過但 CI 失敗？
- 檢查本地 `.env` 文件和 GitHub Secrets 是否使用相同的憑證
- 確保沒有使用本地特定的配置

## 更多信息

查看完整的測試文檔：[TESTING.md](./TESTING.md)
