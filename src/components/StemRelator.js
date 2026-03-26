/**
 * 日時生剋結果展示元件
 */

export function createStemRelator(container, interaction) {
  // interaction = { relation, verdict, description, emoji, dayInfo, hourInfo }
  if (!interaction) {
    container.innerHTML = '';
    return;
  }

  const relationColors = {
    generate: { bg: 'rgba(74, 222, 128, 0.1)', border: '#4ade80', text: '#4ade80' },
    generated: { bg: 'rgba(251, 191, 36, 0.1)', border: '#fbbf24', text: '#fbbf24' },
    overcome: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
    overcomed: { bg: 'rgba(96, 165, 250, 0.1)', border: '#60a5fa', text: '#60a5fa' },
    same: { bg: 'rgba(226, 232, 240, 0.1)', border: '#94a3b8', text: '#e2e8f0' },
  };

  const colors = relationColors[interaction.relation] || relationColors.same;

  container.innerHTML = `
    <div class="stem-section glass-panel result-area">
      <div class="section-header">
        <span class="section-icon">⚖️</span>
        <h2>日時生剋</h2>
      </div>

      <div class="stem-pillars">
        <div class="pillar day-pillar">
          <div class="pillar-label">日干</div>
          <div class="pillar-value">${interaction.dayInfo.stem}</div>
          <div class="pillar-wuxing" style="color: ${getWuxingColor(interaction.dayInfo.wuxing)}">
            ${interaction.dayInfo.wuxing}
          </div>
          <div class="pillar-palace">${interaction.dayInfo.palace}</div>
        </div>

        <div class="relation-arrow">
          <div class="relation-emoji">${interaction.emoji}</div>
          <svg width="80" height="40" viewBox="0 0 80 40" class="arrow-svg">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="${colors.border}" />
              </marker>
            </defs>
            ${interaction.relation === 'generate' || interaction.relation === 'overcome'
              ? `<line x1="65" y1="20" x2="15" y2="20" stroke="${colors.border}" stroke-width="2" marker-end="url(#arrowhead)"/>`
              : `<line x1="15" y1="20" x2="65" y2="20" stroke="${colors.border}" stroke-width="2" marker-end="url(#arrowhead)"/>`
            }
          </svg>
          <div class="relation-type" style="color: ${colors.text}">
            ${interaction.relation === 'generate' ? '生' :
              interaction.relation === 'generated' ? '生' :
              interaction.relation === 'overcome' ? '剋' :
              interaction.relation === 'overcomed' ? '剋' : '比和'}
          </div>
        </div>

        <div class="pillar hour-pillar">
          <div class="pillar-label">時干</div>
          <div class="pillar-value">${interaction.hourInfo.stem}</div>
          <div class="pillar-wuxing" style="color: ${getWuxingColor(interaction.hourInfo.wuxing)}">
            ${interaction.hourInfo.wuxing}
          </div>
          <div class="pillar-palace">${interaction.hourInfo.palace}</div>
        </div>
      </div>

      <div class="verdict-box" style="background: ${colors.bg}; border-color: ${colors.border}">
        <div class="verdict-title" style="color: ${colors.text}">
          ${interaction.emoji} ${interaction.verdict}
        </div>
        <div class="verdict-desc">
          ${interaction.description}
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    container.querySelector('.result-area')?.classList.add('visible');
  });
}

function getWuxingColor(wuxing) {
  const colors = {
    '木': '#22c55e',
    '火': '#ef4444',
    '土': '#d4a147',
    '金': '#e2e8f0',
    '水': '#3b82f6',
  };
  return colors[wuxing] || '#94a3b8';
}
