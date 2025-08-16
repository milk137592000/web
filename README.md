# yunique 專案分解說明

本資料夾包含了從原始 `index.html` 分解出來的 HTML、CSS 和 JavaScript 檔案。

## 檔案結構

```
system/
├── index.html      # 主要 HTML 結構
├── styles.css      # 所有 CSS 樣式
├── script.js       # 所有 JavaScript 功能
└── README.md       # 本說明檔案
```

## 檔案說明

### index.html
- 包含完整的 HTML 結構
- 引用外部 CSS 和 JavaScript 檔案
- 保持與原始檔案相同的 DOM 結構和功能

### styles.css
- 包含所有原始檔案中的 CSS 樣式
- 包括響應式設計、動畫效果、主題樣式等
- 保持原有的視覺效果和互動體驗

### script.js
- 包含所有 JavaScript 功能
- 包括：
  - 專案資料模擬
  - 路由系統
  - 聲波動畫和 Sin 波效果
  - 互動功能（點擊、拖拽、滾輪）
  - Bar 變形和旋轉動畫
  - 專案詳情頁面功能
  - AI 內容生成模擬
  - TTS 語音合成
  - 響應式處理和窗口調整
  - 浮動導航條功能

## 使用方式

1. 將整個 `system` 資料夾複製到您的網頁伺服器
2. 確保圖片檔案路徑正確（目前指向上層目錄的圖片）
3. 在瀏覽器中開啟 `index.html`

## 注意事項

- 圖片路徑使用相對路徑 `../` 指向原專案的圖片檔案
- favicon 路徑也指向原專案的 favicon 檔案
- 所有功能與原始檔案完全相同，包括：
  - Sin 波動畫效果（連續波動）
  - Bar 顏色邏輯（半透明白色 + 當前專案純白色 + 邊框發光）
  - 完整的 Bar 動畫序列：
    * **第一階段**：白色 bar 逐步交換位置移動到中心（swapBarToCenter + animateSwap）
    * **第二階段**：側邊 bar 展開讓位（spreadSideBars）
    * **第三階段**：中心 bar 延長（expandCenterBar）
    * **第四階段**：中心 bar 旋轉90度（rotateCenterBar）
    * **第五階段**：旋轉後 bar 擴展成正方形（expandToSquare）
    * **第六階段**：專案圖片和類別文字動畫顯示
  - 專案標題掉落動畫（dropProjectTitleToSquare）
  - 專案詳情浮動頁面和 AI 內容生成
  - 響應式設計和觸控操作
  - 自動動畫和使用者互動檢測
  - 完整的事件處理和狀態管理

## 相依性

- Tailwind CSS (CDN)
- GSAP 動畫庫 (CDN)
- Google Fonts (Lexend, Noto Sans TC)

## 瀏覽器支援

- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)
- 支援 ES6+ 語法
- 支援 Web Speech API (TTS 功能)
