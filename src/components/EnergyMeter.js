/**
 * 五行能量儀表盤元件
 */

export function createEnergyMeter(container, energyData) {
  if (!container) return;
  if (!energyData) {
    container.innerHTML = '';
    return;
  }

  const { seasonElement, dayElement, hourElement, overall } = energyData;

  // 構建能量條
  function makeBar(label, element, percent, status) {
    const barColor = getStatusColor(status);
    const textColor = getWuxingColor(element.wuxing);
    return `
      <div class="energy-bar-row" style="margin-bottom: 12px;">
        <div class="energy-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; margin-bottom: 4px;">
          <span class="energy-stem" style="font-weight: bold; font-size: 1.1rem; color: #fff;">${element.stem}</span>
          <span class="energy-wuxing" style="color: ${textColor}; font-weight: 600;">${element.wuxing}</span>
          <span class="energy-status" style="color: ${barColor}; font-size: 0.8rem; font-weight: bold;">[${status}]</span>
        </div>
        <div class="energy-bar-track" style="position: relative; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
          <div class="energy-bar-fill" style="width: 0%; height: 100%; background: ${barColor}; transition: width 0.8s ease-out;" data-percent="${percent}">
          </div>
        </div>
        <div style="text-align: right; font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${percent}%</div>
      </div>
    `;
  }

  // 圓形儀表盤
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (overall.percent / 100) * circumference;

  // 強制清空容器防止重複
  container.innerHTML = '';
  
  const section = document.createElement('div');
  section.className = 'energy-section glass-panel result-area';
  section.innerHTML = `
      <div class="section-header">
        <span class="section-icon">⚡</span>
        <h2>五行能量評估</h2>
      </div>

      <div class="energy-season" style="text-align: center; margin-bottom: 20px;">
        <span class="season-badge" style="padding: 4px 16px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); color: ${getWuxingColor(seasonElement)}; font-weight: bold;">
          當令時空：${seasonElement}
        </span>
      </div>

      <div class="energy-content" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: center;">
        <div class="energy-gauge-wrapper" style="width: 140px; height: 140px; flex-shrink: 0;">
          <svg viewBox="0 0 120 120" style="width: 100%; height: 100%; display: block;">
            <circle cx="60" cy="60" r="54"
              fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54"
              fill="none" stroke="${overall.gradeColor}" stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"
              transform="rotate(-90 60 60)"
              style="transition: stroke-dashoffset 1s ease-out;"/>
            <text x="60" y="55" text-anchor="middle" fill="${overall.gradeColor}"
              font-size="22" font-weight="900" font-family="serif">
              ${overall.percent}%
            </text>
            <text x="60" y="75" text-anchor="middle" fill="${overall.gradeColor}"
              font-size="12" font-weight="bold">
              ${overall.gradeEmoji} ${overall.grade}
            </text>
          </svg>
        </div>

        <div class="energy-bars" style="flex: 1; min-width: 200px;">
          ${makeBar('日干', dayElement, dayElement.percent, dayElement.label)}
          ${makeBar('時干', hourElement, hourElement.percent, hourElement.label)}
        </div>
      </div>

      <div class="energy-summary" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border-subtle); font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
        ${getEnergySummary(dayElement, hourElement, overall, seasonElement)}
      </div>
  `;
  
  container.appendChild(section);

  // 動畫啟動
  requestAnimationFrame(() => {
    section.classList.add('visible');
    setTimeout(() => {
      section.querySelectorAll('.energy-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.percent + '%';
      });
    }, 100);
  });
}

function getStatusColor(status) {
  const colors = { '旺': '#4ade80', '相': '#60a5fa', '休': '#fbbf24', '囚': '#f97316', '死': '#ef4444' };
  return colors[status] || '#94a3b8';
}

function getWuxingColor(wuxing) {
  const colors = { '木': '#22c55e', '火': '#ef4444', '土': '#d4a147', '金': '#e2e8f0', '水': '#3b82f6' };
  return colors[wuxing] || '#94a3b8';
}

function getEnergySummary(day, hour, overall, seasonEl) {
  if (overall.percent >= 80) return `目前正值 ${seasonEl} 當令，身主能量充實，氣場極佳，適合採取積極行動。`;
  if (overall.percent >= 60) return `目前 ${seasonEl} 掌權，整體能量平穩中偏強，具備足夠主動權。`;
  if (overall.percent >= 40) return `当前時空能量中庸，需靠個人努力推動，行事宜循序漸進。`;
  if (overall.percent >= 25) return `能量偏低，日、時干氣場受挫，行事宜保守謹慎，防範未然。`;
  return `能量極度匱乏，此時宜守不宜動，建議靜待時機轉變再作打算。`;
}
