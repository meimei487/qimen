/**
 * 九宮格方位圖及其附屬面板元件
 */

import { NINE_PALACES, ZHI_TO_PALACE, PALACE_DIRECTIONS } from '../engine/constants.js';

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

const RELATION_COLORS = {
  generate:  '#4ade80',
  generated: '#fbbf24',
  overcome:  '#ef4444',
  overcomed: '#60a5fa',
  same:      '#94a3b8',
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

// ---------------------------------------------------------
// 第二步：特殊禁忌 (截路空亡)
// ---------------------------------------------------------
export function createWarningPanel(container, advancedData) {
  if (!advancedData.isJieLu) {
    container.innerHTML = ''; // 沒有則隱藏
    return;
  }
  
  container.innerHTML = `
    <div class="legend-group glass-panel result-area" style="border-left: 5px solid #ef4444; background: rgba(239, 68, 68, 0.05);">
       <div class="legend-title" style="color: #f87171; font-weight: 900; letter-spacing: 0.1em;">
         <span class="legend-icon">🛑</span> 特殊重大禁忌 (時辰大忌)
       </div>
       <div style="margin-top: 10px; color: #fca5a5; font-size: 1.05rem; line-height: 1.6;">
          <b>截路空亡</b>：此時辰辦事極易遇阻或徒勞無功。<b>逢此大忌，宜守不宜動。</b>
       </div>
    </div>
  `;
  requestAnimationFrame(() => container.querySelector('.result-area')?.classList.add('visible'));
}

// ---------------------------------------------------------
// 第三步：泊地方位 (出口)
// ---------------------------------------------------------
export function createEscapePanel(container, escapeData) {
  if (!escapeData) return;
  
  container.innerHTML = `
    <div class="legend-group glass-panel result-area">
      <div class="section-header">
        <span class="section-icon">📍</span>
        <h2>泊地吉方 (天門三泊)</h2>
      </div>
      <div class="legend-items" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 5px;">
        <div class="legend-item taichong" style="background: rgba(255,215,0,0.06); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,215,0,0.15);">
          <span class="legend-label"><b>太沖 (卯)</b><br/>&rarr; <span style="color:#ffd700; font-size: 1.2rem; font-weight: 900;">${escapeData.taiChong?.direction || '—'}</span></span>
        </div>
        <div class="legend-item xiaoji" style="background: rgba(96,165,250,0.06); padding: 12px; border-radius: 8px; border: 1px solid rgba(96,165,250,0.15);">
          <span class="legend-label"><b>小吉 (未)</b><br/>&rarr; <span style="color:#60a5fa; font-size: 1.2rem; font-weight: 900;">${escapeData.xiaoJi?.direction || '—'}</span></span>
        </div>
        <div class="legend-item congkui" style="background: rgba(192,132,252,0.06); padding: 12px; border-radius: 8px; border: 1px solid rgba(192,132,252,0.15);">
          <span class="legend-label"><b>從魁 (酉)</b><br/>&rarr; <span style="color:#c084fc; font-size: 1.2rem; font-weight: 900;">${escapeData.congKui?.direction || '—'}</span></span>
        </div>
      </div>
    </div>
  `;
  requestAnimationFrame(() => container.querySelector('.result-area')?.classList.add('visible'));
}

// ---------------------------------------------------------
// 第五步：貴人與空亡 (細項診斷)
// ---------------------------------------------------------
export function createStatusPanel(container, advancedData) {
  const { kongWang, noblemen } = advancedData;
  const noblePalaces = noblemen.map(b => ZHI_TO_PALACE[b]);
  
  container.innerHTML = `
    <div class="legend-group glass-panel result-area">
      <div class="section-header">
        <span class="section-icon">🌫️</span>
        <h2>神效診斷 (貴人與空亡)</h2>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid var(--border-subtle);">
          <div style="color: #94a3b8; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">🌫️</span> 日系空亡 (地雷區)
          </div>
          <div style="color: var(--text-secondary); font-size: 0.92rem;">
            本局空亡：<b>${kongWang.join('、')}</b>。落此方位之事多虛假無力。
          </div>
        </div>
        <div style="background: rgba(168,85,247,0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(168,85,247,0.2);">
          <div style="color: #a855f7; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">✨</span> 天乙貴人 (靠山方位)
          </div>
          <div style="color: var(--text-secondary); font-size: 0.92rem;">
            本時辰貴人：<b>${noblePalaces.join('、')}</b>。此方最利求人辦事。
          </div>
        </div>
      </div>
    </div>
  `;
  requestAnimationFrame(() => container.querySelector('.result-area')?.classList.add('visible'));
}

// ---------------------------------------------------------
// 第六步：九宮方位圖 (SVG)
// ---------------------------------------------------------
export function createNinePalaceGrid(container, escapeData, stemInteraction, advancedData = {}) {
  const highlightPalaces = {};
  if (escapeData) {
    if (escapeData.taiChong) highlightPalaces[escapeData.taiChong.palace] = { label: '太沖', zhi: '卯' };
    if (escapeData.xiaoJi) highlightPalaces[escapeData.xiaoJi.palace] = { label: '小吉', zhi: '未' };
    if (escapeData.congKui) highlightPalaces[escapeData.congKui.palace] = { label: '從魁', zhi: '酉' };
  }

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
    <svg viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" class="nine-palace-svg">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="c"/><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 6 2.5, 0 5" fill="${relationColor}"/></marker>
        <pattern id="void" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.06)" stroke-width="4" /></pattern>
      </defs>
  `;

  const palaceCenters = {};
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const palace = GRID_LAYOUT[row][col];
      const x = padding + col * (cellSize + gap);
      const y = padding + row * (cellSize + gap);
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      palaceCenters[palace] = { cx, cy };

      const isKongWang = advancedData.kongWang?.some(b => ZHI_TO_PALACE[b] === palace);
      const isNobleman = advancedData.noblemen?.some(b => ZHI_TO_PALACE[b] === palace);
      const highlight = highlightPalaces[palace];
      const sArr = stemPalaces[palace] || [];
      
      let stroke = 'rgba(255,255,255,0.1)'; let fill = 'rgba(255,255,255,0.05)'; let glow = false;
      if (isKongWang) { fill = 'rgba(100,116,139,0.12)'; stroke = 'rgba(100,116,139,0.3)'; }
      if (highlight) { stroke = '#ffd700'; fill = isKongWang ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)'; glow = true; }
      if (sArr.length > 1) { stroke = relationColor; fill = `${relationColor}1a`; glow = true; }

      svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${glow?2.5:1}" ${glow?'filter="url(#glow)"':''} />`;
      if (isKongWang) svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9" fill="url(#void)" opacity="0.6" />`;
      
      svgContent += `<g style="opacity:${isKongWang?0.45:1}">`;
      svgContent += `<text x="${x+8}" y="${y+16}" fill="rgba(255,255,255,0.3)" font-size="10">${PALACE_DIRECTIONS[palace]}</text>`;
      if (isKongWang) svgContent += `<circle cx="${x+cellSize-18}" cy="${y+16}" r="9" fill="rgba(100,116,139,0.9)" /><text x="${x+cellSize-18}" y="${y+19.5}" fill="#fff" font-size="9" text-anchor="middle">空</text>`;
      if (isNobleman) { const bX = isKongWang ? x+cellSize-40 : x+cellSize-18; svgContent += `<circle cx="${bX}" cy="${y+16}" r="9" fill="rgba(168,85,247,0.8)" /><text x="${bX}" y="${y+19.5}" fill="#fff" font-size="9" text-anchor="middle">貴</text>`; }
      svgContent += `<text x="${x+cellSize-9}" y="${y+cellSize-8}" fill="${PALACE_COLORS[palace]}" font-size="12" text-anchor="end" opacity="0.5">${PALACE_WUXING_LABELS[palace]}</text>`;
      svgContent += `<text x="${cx}" y="${y+cellSize*0.36}" fill="rgba(255,255,255,0.8)" font-size="18" text-anchor="middle">${palace.replace('宮','')}</text>`;
      
      let sY = y + cellSize * 0.58;
      sArr.forEach(s => {
        const rC = s.role === 'day' ? '#93c5fd' : '#fca5a5';
        svgContent += `<rect x="${cx-30}" y="${sY-9.5}" width="60" height="19" rx="10" fill="${rC}1a" stroke="${rC}" stroke-width="0.8" />
                       <text x="${cx-22}" y="${sY+4.5}" fill="${rC}" font-size="9">${s.role==='day'?'日':'時'}干</text>
                       <text x="${cx+5}" y="${sY+5}" fill="${getWuxingColor(s.wuxing)}" font-size="14" font-weight="bold">${s.stem}</text>`;
        sY += 22;
      });
      if (highlight) svgContent += `<text x="${cx}" y="${y+cellSize*0.82}" fill="#ffd700" font-size="10.5" text-anchor="middle" font-weight="bold">${highlight.label}</text>`;
      svgContent += `</g>`;
    }
  }

  if (stemInteraction) {
    const { dayInfo, hourInfo, relation } = stemInteraction;
    const a = hourInfo?.palace; const b = dayInfo?.palace;
    if (a && b && a !== b) {
      const c1 = palaceCenters[a]; const c2 = palaceCenters[b];
      const start = (relation==='generate'||relation==='overcome') ? c1 : c2;
      const end = (relation==='generate'||relation==='overcome') ? c2 : c1;
      svgContent += `<line x1="${start.cx}" y1="${start.cy}" x2="${end.cx}" y2="${end.cy}" stroke="${relationColor}" stroke-width="1.8" stroke-dasharray="5,4" marker-end="url(#arrow)"/>`;
      svgContent += `<circle cx="${(start.cx+end.cx)/2}" cy="${(start.cy+end.cy)/2}" r="12" fill="#080c18" stroke="${relationColor}" />
                     <text x="${(start.cx+end.cx)/2}" y="${(start.cy+end.cy)/2+5}" text-anchor="middle" fill="${relationColor}" font-size="13">${RELATION_LABELS[relation]}</text>`;
    }
  }

  svgContent += '</svg>';
  container.innerHTML = `<div class="glass-panel result-area"><div class="section-header"><span class="section-icon">🧭</span><h2>九宮方位星圖</h2></div><div class="nine-palace-wrapper">${svgContent}</div></div>`;
  requestAnimationFrame(() => container.querySelector('.result-area')?.classList.add('visible'));
}
