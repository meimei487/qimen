/**
 * 九宮格方位圖 SVG 元件
 */

import { NINE_PALACES, ZHI_TO_PALACE } from '../engine/constants.js';

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

const PALACE_DIRECTIONS = {
  '巽宮': '東南', '離宮': '南', '坤宮': '西南',
  '震宮': '東', '中宮': '中', '兌宮': '西',
  '艮宮': '東北', '坎宮': '北', '乾宮': '西北',
};

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

export function createNinePalaceGrid(container, escapeData, stemInteraction) {
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

      if (isEscapeHighlight) {
        strokeColor = '#ffd700'; strokeWidth = 2.5;
        fillColor = 'rgba(255,215,0,0.10)'; useGlow = true;
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
          class="palace-cell ${isEscapeHighlight ? 'palace-highlighted' : ''}"
        />
      `;

      // 方位名（左上角，小字）
      svgContent += `
        <text x="${x + 8}" y="${y + 16}" fill="rgba(255,255,255,0.38)" font-size="10" font-family="Inter, sans-serif">
          ${direction}
        </text>
      `;

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
          offsetY += 24;
        }
      }
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

  // Legend
  let legendHTML = '';
  if (escapeData || stemInteraction) {
    const escapePart = escapeData ? `
      <div class="legend-group">
        <div class="legend-title">📍 泊地方位</div>
        <div class="legend-items">
          <div class="legend-item taichong"><span class="legend-dot"></span><span>太沖（卯）→ ${escapeData.taiChong?.direction || '—'}</span></div>
          <div class="legend-item xiaoji"><span class="legend-dot"></span><span>小吉（未）→ ${escapeData.xiaoJi?.direction || '—'}</span></div>
          <div class="legend-item congkui"><span class="legend-dot"></span><span>從魁（酉）→ ${escapeData.congKui?.direction || '—'}</span></div>
        </div>
      </div>
    ` : '';

    const stemPart = stemInteraction ? (() => {
      const { relation, verdict, dayInfo, hourInfo } = stemInteraction;
      const rc = RELATION_COLORS[relation] || '#94a3b8';
      return `
        <div class="legend-group legend-stem-group">
          <div class="legend-title">🔗 日時宮位生剋</div>
          <div class="stem-palace-row">
            <span class="sp-badge day-badge">日 ${dayInfo.stem}</span>
            <span class="sp-palace">${dayInfo.palace}</span>
            <span class="sp-relation" style="color:${rc}">${RELATION_LABELS[relation]}</span>
            <span class="sp-palace">${hourInfo.palace}</span>
            <span class="sp-badge hour-badge">時 ${hourInfo.stem}</span>
          </div>
          <div class="sp-verdict" style="color:${rc}">${verdict}</div>
        </div>
      `;
    })() : '';

    legendHTML = `<div class="direction-legend">${escapePart}${stemPart}</div>`;
  }

  container.innerHTML = `
    <div class="nine-palace-section glass-panel result-area">
      <div class="section-header">
        <span class="section-icon">🧭</span>
        <h2>九宮方位</h2>
      </div>
      <div class="nine-palace-wrapper">
        ${svgContent}
      </div>
      ${legendHTML}
    </div>
  `;

  // 延遲添加可見類
  requestAnimationFrame(() => {
    container.querySelector('.result-area')?.classList.add('visible');
  });
}
