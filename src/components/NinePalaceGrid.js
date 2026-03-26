/**
 * 九宮格方位圖 SVG 元件
 */

import { NINE_PALACES, ZHI_TO_PALACE, PALACE_DIRECTIONS } from '../engine/constants.js';

/**
 * 九宮格佈局 (洛書排列):
 *   巽(4) | 離(9) | 坤(2)
 *   震(3) | 中(5) | 兌(7)
 *   艮(8) | 坎(1) | 乾(6)
 */
const GRID_LAYOUT = [
  ['巽宮', '離宮', '坤宮'],
  ['震宮', '中宮', '兌宮'],
  ['艮宮', '坎宮', '乾宮'],
];

const PALACE_COLORS = {
  '巽宮': '#22c55e', '離宮': '#ef4444', '坤宮': '#a3763d',
  '震宮': '#22c55e', '中宮': '#a3763d', '兌宮': '#e2e8f0',
  '艮宮': '#a3763d', '坎宮': '#3b82f6', '乾宮': '#e2e8f0',
};

const PALACE_WUXING_LABELS = {
  '巽宮': '木', '離宮': '火', '坤宮': '土',
  '震宮': '木', '中宮': '土', '兌宮': '金',
  '艮宮': '土', '坎宮': '水', '乾宮': '金',
};

// 生剋關係顏色
const RELATION_COLORS = {
  generate:  '#4ade80', // 時生日 — 綠
  generated: '#fbbf24', // 日生時 — 黃
  overcome:  '#ef4444', // 時剋日 — 紅
  overcomed: '#60a5fa', // 日剋時 — 藍
  same:      '#94a3b8', // 比和   — 灰
};

const RELATION_LABELS = {
  generate:  '生',
  generated: '生',
  overcome:  '剋',
  overcomed: '剋',
  same:      '和',
};

function getWuxingColor(wuxing) {
  const colors = { '木': '#22c55e', '火': '#ef4444', '土': '#d4a147', '金': '#e2e8f0', '水': '#3b82f6' };
  return colors[wuxing] || '#94a3b8';
}

export function createNinePalaceGrid(container, escapeData, stemInteraction, advancedData = {}) {
  // escapeData = { taiChong, xiaoJi, congKui, allDirections }
  // stemInteraction = { relation, dayInfo: { palace, stem, wuxing }, hourInfo: { palace, stem, wuxing } }

  const highlightPalaces = {};
  if (escapeData) {
    if (escapeData.taiChong) {
      highlightPalaces[escapeData.taiChong.palace] = { label: '太沖', zhi: '卯', type: 'escape' };
    }
    if (escapeData.xiaoJi) {
      highlightPalaces[escapeData.xiaoJi.palace] = { label: '小吉', zhi: '未', type: 'escape' };
    }
    if (escapeData.congKui) {
      highlightPalaces[escapeData.congKui.palace] = { label: '從魁', zhi: '酉', type: 'escape' };
    }
  }

  // 日干 / 時干 宮位標記
  const stemPalaces = {};
  let relationColor = '#94a3b8';
  let relationLabel = '';
  if (stemInteraction) {
    const { relation, dayInfo, hourInfo } = stemInteraction;
    relationColor = RELATION_COLORS[relation] || '#94a3b8';
    relationLabel = RELATION_LABELS[relation] || '';

    if (dayInfo?.palace) {
      stemPalaces[dayInfo.palace] = stemPalaces[dayInfo.palace] || [];
      stemPalaces[dayInfo.palace].push({ stem: dayInfo.stem, wuxing: dayInfo.wuxing, role: 'day' });
    }
    if (hourInfo?.palace) {
      stemPalaces[hourInfo.palace] = stemPalaces[hourInfo.palace] || [];
      stemPalaces[hourInfo.palace].push({ stem: hourInfo.stem, wuxing: hourInfo.wuxing, role: 'hour' });
    }
  }

  const cellSize = 132;
  const padding = 14;
  const gap = 6;
  const totalSize = cellSize * 3 + gap * 2 + padding * 2;

  let svgContent = `
    <svg viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" class="nine-palace-svg" role="img" aria-label="九宮格方位圖">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
        </linearGradient>
        <marker id="rel-arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="${relationColor}" opacity="0.8"/>
        </marker>
        <!-- 🌀 空亡斜紋圖案 -->
        <pattern id="void-pattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.06)" stroke-width="4" />
        </pattern>
      </defs>
  `;

  // 收集宮位中心座標，用於畫連線
  const palaceCenters = {};

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const palace = GRID_LAYOUT[row][col];
      const x = padding + col * (cellSize + gap);
      const y = padding + row * (cellSize + gap);
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      palaceCenters[palace] = { cx, cy };

      const direction = PALACE_DIRECTIONS[palace];
      const wuxing = PALACE_WUXING_LABELS[palace];
      const color = PALACE_COLORS[palace];
      const highlight = highlightPalaces[palace];
      const isEscapeHighlight = !!highlight;
      const stemArr = stemPalaces[palace] || [];
      const hasStem = stemArr.length > 0;
      const hasDay = stemArr.some(s => s.role === 'day');
      const hasHour = stemArr.some(s => s.role === 'hour');
      const hasBoth = hasDay && hasHour;

      // 進階斷法徽章檢查
      const isKongWang = advancedData.kongWang?.some(b => ZHI_TO_PALACE[b] === palace);
      const isNobleman = advancedData.noblemen?.some(b => ZHI_TO_PALACE[b] === palace);

      // ── 三個固定垂直區塊 ──────────────────────────
      //  zone1 (宮名)   ~ 35% 高
      //  zone2 (干名)   ~ 58% 高（中部）
      //  zone3 (逃難)   ~ 80% 高（底部）
      const zone1Y = y + cellSize * 0.36;
      const zone2Y = y + cellSize * 0.58;
      const zone3Y = y + cellSize * 0.80;

      // 邊框色優先級（逃難金 > 日藍 > 時紅 > 預設）
      let strokeColor = 'rgba(255,255,255,0.1)';
      let strokeWidth = 1;
      let fillColor = 'rgba(255,255,255,0.05)';
      let useGlow = false;

      if (isKongWang) {
        fillColor = 'rgba(100,116,139,0.12)'; 
        strokeColor = 'rgba(100,116,139,0.3)';
        useGlow = false;
      }

      if (isEscapeHighlight) {
        strokeColor = '#ffd700'; strokeWidth = 2.5;
        fillColor = isKongWang ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.10)'; 
        useGlow = true;
      }
      if (hasBoth) {
        strokeColor = relationColor; strokeWidth = 2.5;
        fillColor = `${relationColor}18`; useGlow = true;
      } else if (hasDay) {
        strokeColor = '#60a5fa'; strokeWidth = 2;
        fillColor = 'rgba(96,165,250,0.07)'; useGlow = true;
      } else if (hasHour) {
        strokeColor = '#f87171'; strokeWidth = 2;
        fillColor = 'rgba(248,113,113,0.07)'; useGlow = true;
      }

      // 背景矩形
      svgContent += `
        <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9"
          fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"
          ${useGlow ? 'filter="url(#glow)"' : ''}
          class="palace-cell ${isEscapeHighlight ? 'palace-highlighted' : ''} ${isKongWang ? 'palace-void' : ''}"
        />
        ${isKongWang ? `
          <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9"
            fill="url(#void-pattern)" opacity="0.6" pointer-events="none" />
        ` : ''}
      `;

      // 內容群組 (若空亡則半透明)
      svgContent += `<g style="opacity: ${isKongWang ? 0.45 : 1};">`;

      // 方位名（左上角，小字）
      svgContent += `
        <text x="${x + 8}" y="${y + 16}" fill="rgba(255,255,255,0.38)" font-size="10" font-family="Inter, sans-serif">
          ${direction}
        </text>
      `;

      // 空亡徽章
      if (isKongWang) {
        svgContent += `
          <circle cx="${x + cellSize - 18}" cy="${y + 16}" r="9" fill="rgba(100,116,139,0.9)" />
          <text x="${x + cellSize - 18}" y="${y + 19.5}" fill="#fff" font-size="9" text-anchor="middle" font-family="'Noto Serif TC', serif" font-weight="bold">空</text>
        `;
      }
      
      // 貴人徽章
      if (isNobleman) {
        // 如果有空亡徽章，往左移
        const badgeX = isKongWang ? x + cellSize - 40 : x + cellSize - 18;
        svgContent += `
          <circle cx="${badgeX}" cy="${y + 16}" r="9" fill="rgba(168,85,247,0.9)" />
          <text x="${badgeX}" y="${y + 19.5}" fill="#fff" font-size="9" text-anchor="middle" font-family="'Noto Serif TC', serif" font-weight="bold">貴</text>
        `;
      }

      // 五行標籤（右下角）
      svgContent += `
        <text x="${x + cellSize - 9}" y="${y + cellSize - 8}" fill="${color}" font-size="12"
          text-anchor="end" font-family="'Noto Serif TC', serif" opacity="0.55">
          ${wuxing}
        </text>
      `;

      // ── Zone 1：宮名 ──────────────────────────────
      svgContent += `
        <text x="${cx}" y="${zone1Y}" fill="${isEscapeHighlight ? '#ffd700' : 'rgba(255,255,255,0.88)'}"
          font-size="18" font-weight="${isEscapeHighlight || hasStem ? 'bold' : 'normal'}"
          text-anchor="middle" font-family="'Noto Serif TC', serif"
          ${isEscapeHighlight ? 'filter="url(#glow)"' : ''}>
          ${palace.replace('宮', '')}
        </text>
      `;

      // ── Zone 2：干名膠囊 ──────────────────────────
      if (hasStem) {
        const capsuleW = 60;
        const capsuleH = 19;
        let stemOffY = zone2Y;
        for (const s of stemArr) {
          const roleColor = s.role === 'day' ? '#93c5fd' : '#fca5a5';
          const roleLabel = s.role === 'day' ? '日' : '時';
          const wxColor = getWuxingColor(s.wuxing);
          svgContent += `
            <rect x="${cx - capsuleW / 2}" y="${stemOffY - capsuleH / 2}" width="${capsuleW}" height="${capsuleH}" rx="10"
              fill="${roleColor}1a" stroke="${roleColor}" stroke-width="0.9"/>
            <text x="${cx - capsuleW / 2 + 8}" y="${stemOffY + 4.5}" fill="${roleColor}" font-size="9.5"
              font-family="'Noto Serif TC', serif" font-weight="600">${roleLabel}干</text>
            <text x="${cx + 5}" y="${stemOffY + 5}" fill="${wxColor}" font-size="14"
              font-family="'Noto Serif TC', serif" font-weight="bold">${s.stem}</text>
          `;
          stemOffY += 22;
        }
      }

      // ── Zone 3：逃難標籤 ─────────────────────────
      if (isEscapeHighlight) {
        svgContent += `
          <text x="${cx}" y="${zone3Y}" fill="#ffd700"
            font-size="10.5" text-anchor="middle" font-weight="bold"
            font-family="'Noto Serif TC', serif" filter="url(#glow)">
            ${highlight.label}（${highlight.zhi}）
          </text>
        `;
        // 右上角小三角標記
        svgContent += `
          <polygon points="${x + cellSize - 16},${y} ${x + cellSize},${y} ${x + cellSize},${y + 16}"
            fill="#ffd700" opacity="0.5"/>
        `;
      }

      svgContent += `</g>`; // 關閉內容群組
    }
  }

  // 畫日干→時干連線（不同宮時）
  if (stemInteraction) {
    const { dayInfo, hourInfo, relation } = stemInteraction;
    const dayPalace = dayInfo?.palace;
    const hourPalace = hourInfo?.palace;
    if (dayPalace && hourPalace && dayPalace !== hourPalace) {
      const dc = palaceCenters[dayPalace];
      const hc = palaceCenters[hourPalace];
      if (dc && hc) {
        const fromC = (relation === 'generate' || relation === 'overcome') ? hc : dc;
        const toC   = (relation === 'generate' || relation === 'overcome') ? dc : hc;

        svgContent += `
          <line x1="${fromC.cx}" y1="${fromC.cy}" x2="${toC.cx}" y2="${toC.cy}"
            stroke="${relationColor}" stroke-width="1.8" stroke-dasharray="5,4" opacity="0.7"
            marker-end="url(#rel-arrow)"/>
        `;

        const midX = (fromC.cx + toC.cx) / 2;
        const midY = (fromC.cy + toC.cy) / 2;
        svgContent += `
          <circle cx="${midX}" cy="${midY}" r="12" fill="rgba(10,14,26,0.85)" stroke="${relationColor}" stroke-width="1.2"/>
          <text x="${midX}" y="${midY + 5}" text-anchor="middle" fill="${relationColor}"
            font-size="13" font-weight="bold" font-family="'Noto Serif TC', serif">
            ${relationLabel}
          </text>
        `;
      }
    }
  }

  // 中宮太極（未被佔用時）
  const midCenter = palaceCenters['中宮'];
  if (midCenter && !stemPalaces['中宮']?.length && !highlightPalaces['中宮']) {
    const { cx, cy } = midCenter;
    svgContent += `
      <circle cx="${cx}" cy="${cy + 6}" r="16" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <path d="M ${cx} ${cy - 10} A 8 8 0 0 1 ${cx} ${cy + 22} A 16 16 0 0 1 ${cx} ${cy - 10}" fill="rgba(255,255,255,0.07)"/>
    `;
  }

  svgContent += '</svg>';

  // 建立獨立的區塊 HTML
  const escapePart = escapeData ? `
    <div class="legend-group glass-panel result-area" style="margin-top: 16px;">
      <div class="legend-title"><span class="legend-icon" style="color:#ffd700">📍</span> 泊地吉方 (天門三泊)</div>
      <div class="legend-items">
        <div class="legend-item taichong"><span class="legend-dot"></span><span>太沖（卯）&rarr; <b style="color:#ffd700">${escapeData.taiChong?.direction || '—'}</b></span></div>
        <div class="legend-item xiaoji"><span class="legend-dot"></span><span>小吉（未）&rarr; <b style="color:#60a5fa">${escapeData.xiaoJi?.direction || '—'}</b></span></div>
        <div class="legend-item congkui"><span class="legend-dot"></span><span>從魁（酉）&rarr; <b style="color:#c084fc">${escapeData.congKui?.direction || '—'}</b></span></div>
      </div>
    </div>
  ` : '';

  const advancedPart = (advancedData.isJieLu || advancedData.kongWang?.length) ? `
    <div class="legend-group glass-panel result-area" style="margin-top: 16px; border-left: 4px solid #f87171;">
      <div class="legend-title" style="color: #f87171;"><span class="legend-icon">⚠️</span> 特殊星曜警示</div>
      <div class="legend-items" style="font-size: 0.95em;">
        ${advancedData.isJieLu ? `
          <div style="margin-bottom:8px; background: rgba(239, 68, 68, 0.08); padding: 10px; border-radius: 8px;">
            <span style="color:#ef4444;font-weight:bold;">🛑 截路空亡</span>：此時辰出行辦事易遇阻礙，建議守成。
          </div>` : ''}
        ${advancedData.kongWang?.length ? `
          <div style="display:flex; align-items:flex-start; gap:8px; padding: 0 5px;">
            <span style="font-size:1.2rem">🌫️</span>
            <span><b style="color:#94a3b8;">日系空亡</b>：落在【${advancedData.kongWang.join('、')}】位，能量減弱，不可全信。</span>
          </div>` : ''}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <!-- 3. 九宮星圖 -->
    <div class="nine-palace-section glass-panel result-area">
      <div class="section-header">
        <span class="section-icon">🧭</span>
        <h2>九宮方位圖</h2>
      </div>
      <div class="nine-palace-wrapper">
        ${svgContent}
      </div>
    </div>

    <!-- 泊地與警示 (獨立區塊) -->
    ${escapePart}
    ${advancedPart}
  `;


  // 延遲添加可見類 (確保所有獨立區塊都能顯示)
  requestAnimationFrame(() => {
    const blocks = container.querySelectorAll('.result-area');
    blocks.forEach((block, index) => {
      setTimeout(() => {
        block.classList.add('visible');
      }, index * 120); // 稍微錯開，進步感更強
    });
  });
}
