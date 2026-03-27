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
export function createWarningPanel(container, hourBranch, advancedData) {
  const { isJieLu, kongWang } = advancedData;
  const isHourVoid = kongWang?.includes(hourBranch);
  
  container.innerHTML = ''; // 清空
  const wrapper = document.createElement('div');
  wrapper.className = 'legend-group glass-panel result-area';
  
  if (!isJieLu && !isHourVoid) {
    wrapper.style.cssText = 'opacity: 0.7; border-left: 5px solid #10b981; background: rgba(16, 185, 129, 0.03);';
    wrapper.innerHTML = `
       <div style="color: #6ee7b7; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
         <span style="font-size: 1.2rem;">✅</span> 當前時空無重大「截路」或「空亡」禁忌，可放心依計畫行事。
       </div>
    `;
  } else {
    let warningHtml = '';
    if (isJieLu) {
      warningHtml += `
        <div style="margin-bottom: 12px; color: #fca5a5; font-size: 1.05rem; line-height: 1.6;">
          <b style="color: #ef4444;">🛑 截路空亡</b>：此時辰辦事極易遇阻或徒勞無功。<b>宜守不宜動。</b>
        </div>`;
    }
    if (isHourVoid) {
      warningHtml += `
        <div style="color: #fbbf24; font-size: 1.05rem; line-height: 1.6;">
          <b style="color: #fbbf24;">🌪️ 時落空亡</b>：當前時辰落入日系空亡區（${kongWang.join('、')}），事多虛假，成事不易。
        </div>`;
    }
    
    wrapper.style.cssText = `border-left: 5px solid ${isJieLu ? '#ef4444' : '#fbbf24'}; background: rgba(255, 150, 0, 0.05);`;
    wrapper.innerHTML = `
         <div class="legend-title" style="color: ${isJieLu ? '#f87171' : '#fbbf24'}; font-weight: 900; letter-spacing: 0.1em;">
           <span class="legend-icon">⚠️</span> 特殊重大禁忌 (時辰大忌)
         </div>
         <div style="margin-top: 10px;">
           ${warningHtml}
         </div>
    `;
  }
  container.appendChild(wrapper);
  requestAnimationFrame(() => wrapper.classList.add('visible'));
}

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

export function createNinePalaceGrid(container, escapeData, stemInteraction, advancedData = {}) {
  const highlightPalaces = {};
  if (escapeData) {
    if (escapeData.taiChong) highlightPalaces[escapeData.taiChong.palace] = { label: '太沖' };
    if (escapeData.xiaoJi) highlightPalaces[escapeData.xiaoJi.palace] = { label: '小吉' };
    if (escapeData.congKui) highlightPalaces[escapeData.congKui.palace] = { label: '從魁' };
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
        <pattern id="voidPattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.06)" stroke-width="4" /></pattern>
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

      const { kongWang, noblemen, dayStemTombPalace } = advancedData;
      const isKongWang = kongWang?.some(z => ZHI_TO_PALACE[z] === palace);
      const isNobleman = noblemen?.some(z => ZHI_TO_PALACE[z] === palace);
      const isTomb = dayStemTombPalace === palace;
      const highlight = highlightPalaces[palace];
      const sArr = stemPalaces[palace] || [];
      
      let stroke = 'rgba(255,255,255,0.1)'; 
      let fill = 'rgba(255,255,255,0.05)'; 
      let glow = false;

      if (isKongWang) { fill = 'rgba(100,116,139,0.12)'; stroke = 'rgba(100,116,139,0.3)'; }
      if (highlight) { stroke = '#ffd700'; fill = isKongWang ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)'; glow = true; }
      if (sArr.length > 1) { stroke = relationColor; fill = `${relationColor}1a`; glow = true; }

      svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${glow?2.5:1}" ${glow?'filter="url(#glow)"':''} />`;
      if (isKongWang) svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="9" fill="url(#voidPattern)" opacity="0.6" />`;
      
      svgContent += `<g style="opacity:${isKongWang?0.45:1}">
          <text x="${x+8}" y="${y+18}" fill="rgba(255,255,255,0.3)" font-size="10">${PALACE_DIRECTIONS[palace]}</text>`;
      
      let badgeX = x + cellSize - 18;
      if (isKongWang) {
        svgContent += `<circle cx="${badgeX}" cy="${y+16}" r="9" fill="rgba(100,116,139,0.9)" /><text x="${badgeX}" y="${y+19}" fill="#fff" font-size="9" text-anchor="middle">空</text>`;
        badgeX -= 22;
      }
      if (isNobleman) {
        svgContent += `<circle cx="${badgeX}" cy="${y+16}" r="9" fill="rgba(168,85,247,0.8)" /><text x="${badgeX}" y="${y+19}" fill="#fff" font-size="9" text-anchor="middle">貴</text>`;
        badgeX -= 22;
      }
      if (isTomb) {
        svgContent += `<circle cx="${badgeX}" cy="${y+16}" r="9" fill="rgba(88,28,135,0.95)" /><text x="${badgeX}" y="${y+19}" fill="#fff" font-size="9" text-anchor="middle">墓</text>`;
        badgeX -= 22;
      }

      svgContent += `<text x="${x+cellSize-9}" y="${y+cellSize-8}" fill="${PALACE_COLORS[palace]}" font-size="12" text-anchor="end" opacity="0.5">${PALACE_WUXING_LABELS[palace]}</text>
                     <text x="${cx}" y="${y+cellSize*0.42}" fill="rgba(255,255,255,0.8)" font-size="20" text-anchor="middle">${palace.replace('宮','')}</text>`;
      
      let sY = y + cellSize * 0.62;
      sArr.forEach(s => {
        const rC = s.role === 'day' ? '#93c5fd' : '#fca5a5';
        svgContent += `
          <g transform="translate(${cx-30}, ${sY-9.5})">
            <rect x="0" y="0" width="60" height="19" rx="10" fill="${rC}1a" stroke="${rC}" stroke-width="0.8" />
            <text x="8" y="13" fill="${rC}" font-size="9">${s.role==='day'?'日':'時'}干</text>
            <text x="35" y="14" fill="${getWuxingColor(s.wuxing)}" font-size="14" font-weight="bold">${s.stem}</text>
          </g>`;
        sY += 22;
      });
      if (highlight) svgContent += `<text x="${cx}" y="${y+cellSize*0.86}" fill="#ffd700" font-size="12" text-anchor="middle" font-weight="bold">${highlight.label}</text>`;
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
  container.innerHTML = `
    <div class="glass-panel result-area">
      <div class="section-header"><span class="section-icon">🧭</span><h2>九宮方位星圖</h2></div>
      <div class="nine-palace-wrapper">${svgContent}</div>
    </div>
  `;
  requestAnimationFrame(() => container.querySelector('.result-area')?.classList.add('visible'));
}
