# Netlify 部署指南

本文檔說明如何將此 Reading List 應用部署到 Netlify。

## 自動部署設置

### 方式一：通過 Netlify 網站手動連接（推薦）

1. **登入 Netlify**
   - 前往 [Netlify](https://app.netlify.com/)
   - 使用 GitHub 帳號登入

2. **導入項目**
   - 點擊 "Add new site" → "Import an existing project"
   - 選擇 "GitHub"
   - 授權 Netlify 訪問你的 GitHub 倉庫
   - 選擇 `Personal_Bookmark` 倉庫

3. **配置構建設置**

   Netlify 會自動檢測到 `netlify.toml` 配置文件，但請確認以下設置：
   - **Branch to deploy**: `main` 或你的主分支
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **設置環境變量**

   在 Netlify 項目設置中添加以下環境變量：
   - 前往 Site settings → Environment variables
   - 添加以下變量：
     ```
     VITE_SUPABASE_URL=你的_supabase_項目_url
     VITE_SUPABASE_ANON_KEY=你的_supabase_匿名_密鑰
     ```

   > 💡 從 [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) 獲取這些值

5. **部署**
   - 點擊 "Deploy site"
   - Netlify 會自動構建和部署你的應用

### 方式二：使用 Netlify CLI

1. **安裝 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登入 Netlify**
   ```bash
   netlify login
   ```

3. **初始化項目**
   ```bash
   netlify init
   ```

4. **設置環境變量**
   ```bash
   netlify env:set VITE_SUPABASE_URL "你的_supabase_項目_url"
   netlify env:set VITE_SUPABASE_ANON_KEY "你的_supabase_匿名_密鑰"
   ```

5. **手動部署（可選）**
   ```bash
   netlify deploy --prod
   ```

## CI/CD 自動化

一旦設置完成，Netlify 會自動：

- ✅ 監聽指定分支的 push 事件
- ✅ 自動運行構建命令 `npm run build`
- ✅ 部署構建產物到 CDN
- ✅ 提供 HTTPS 和自定義域名支持
- ✅ 為每個 Pull Request 創建預覽部署

## 構建優化

`netlify.toml` 文件已配置以下優化：

- CSS/JS 自動打包和壓縮
- 靜態資源長期緩存（1年）
- 安全 Headers（XSS 保護、Frame 保護等）
- SPA 路由支持（所有路由重定向到 index.html）

## 本地測試構建

在部署前，可以本地測試構建：

```bash
# 構建項目
npm run build

# 預覽構建結果
npm run preview
```

## 監控和日誌

- **部署日誌**: 在 Netlify Dashboard → Deploys 查看
- **函數日誌**: 在 Netlify Dashboard → Functions 查看（如果使用 Netlify Functions）
- **分析**: 在 Site settings → Analytics 啟用

## 自定義域名（可選）

1. 前往 Site settings → Domain management
2. 點擊 "Add custom domain"
3. 按照指示配置 DNS 記錄

## 疑難排解

### 構建失敗

- 檢查 Netlify 部署日誌
- 確保環境變量已正確設置
- 確認 Node.js 版本兼容（本項目使用 Node 18）

### 404 錯誤

- 確認 `netlify.toml` 中的重定向規則已配置
- 檢查 publish 目錄設置為 `dist`

### 環境變量未生效

- 確保環境變量以 `VITE_` 開頭（Vite 要求）
- 在修改環境變量後重新部署

## 相關資源

- [Netlify 文檔](https://docs.netlify.com/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Supabase 文檔](https://supabase.com/docs)
