/**
 * 奇門遁甲預測工具 — 主入口
 */

import './style.css';
import { createDateTimeInput } from './components/DateTimeInput.js';
import { createNinePalaceGrid } from './components/NinePalaceGrid.js';
import { createStemRelator } from './components/StemRelator.js';
import { createEnergyMeter } from './components/EnergyMeter.js';
import { createResultPanel } from './components/ResultPanel.js';
import { createMasterVerdictPanel } from './components/MasterVerdictPanel.js';

import { getFourPillars, getMonthGeneral, evaluateEnergy, getKongWang, isJieLuKongWang, getNoblemanBranches, assessPillarInteraction, getTombBranch, ZHI_TO_PALACE } from './engine/constants.js';
import { getEscapeDirections } from './engine/directions.js';
import { generateMasterVerdict } from './engine/masterVerdict.js';

// 容器
const inputArea = document.getElementById('input-area');
const energyArea = document.getElementById('energy-area');
const warningArea = document.getElementById('warning-area');
const escapeArea = document.getElementById('escape-area');
const stemArea = document.getElementById('stem-area');
const statusArea = document.getElementById('status-area');
const palaceArea = document.getElementById('palace-area');
const verdictArea = document.getElementById('master-verdict-area');
const resultArea = document.getElementById('result-area');

// 初始化輸入元件
createDateTimeInput(inputArea, onCalculate);

/**
 * 主計算函式 — 當使用者點擊「開始占卜」時觸發
 */
function onCalculate(date) {
  try {
    const fourPillars = getFourPillars(date);
    const monthGeneralInfo = getMonthGeneral(date);
    const hourBranch = fourPillars.hour.branch;
    const escapeDirections = getEscapeDirections(monthGeneralInfo.monthGeneral, hourBranch);
    const stemInteraction = assessPillarInteraction(fourPillars.day, fourPillars.hour);
    const energyResult = evaluateEnergy(fourPillars.day.stem, fourPillars.hour.stem, monthGeneralInfo.lunarMonth);
    const kongWang = getKongWang(fourPillars.day.stem, fourPillars.day.branch);
    const isJieLu = isJieLuKongWang(fourPillars.day.stem, hourBranch);
    const noblemen = getNoblemanBranches(fourPillars.day.stem);

    // 加入入墓計算 (僅針對日干)
    const tombBranch = getTombBranch(fourPillars.day.stem);
    const dayStemTombPalace = tombBranch ? ZHI_TO_PALACE[tombBranch] : null;

    const advancedData = { kongWang, isJieLu, noblemen, dayStemTombPalace, dayStem: fourPillars.day.stem };
    const masterVerdict = generateMasterVerdict(stemInteraction, energyResult, advancedData, escapeDirections);

    // ---------------------------------------------------------
    // 渲染 8 大步驟 (瀑布流步進)
    // ---------------------------------------------------------
    
    // 1. 五行能量 (氣數)
    createEnergyMeter(energyArea, energyResult);

    // 2. 特殊禁忌 (地雷)
    setTimeout(() => {
      import('./components/NinePalaceGrid.js').then(m => m.createWarningPanel(warningArea, hourBranch, advancedData));
    }, 150);

    // 3. 泊地方位 (出口)
    setTimeout(() => {
      import('./components/NinePalaceGrid.js').then(m => m.createEscapePanel(escapeArea, escapeDirections));
    }, 300);

    // 4. 日時生剋 (關係)
    setTimeout(() => {
      createStemRelator(stemArea, stemInteraction);
    }, 450);

    // 5. 貴人/空亡 (診斷)
    setTimeout(() => {
      import('./components/NinePalaceGrid.js').then(m => m.createStatusPanel(statusArea, advancedData));
    }, 600);

    // 6. 九宮星圖 (地圖)
    setTimeout(() => {
      createNinePalaceGrid(palaceArea, escapeDirections, stemInteraction, advancedData);
    }, 750);

    // 7. 大師總評 (指引)
    setTimeout(() => {
      createMasterVerdictPanel(verdictArea, masterVerdict);
    }, 950);

    // 8. 詳細資訊 (數據)
    setTimeout(() => {
      createResultPanel(resultArea, { fourPillars, monthGeneralInfo, date });
    }, 1150);

    // 滾動到能量區
    setTimeout(() => {
      energyArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (err) {
    console.error('計算錯誤:', err);
    showError('計算過程發生錯誤，請確認輸入是否正確。');
  }
}

function showError(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 粒子背景動畫
function initParticles() {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  const particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    };
  }

  function init() {
    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
      ctx.fill();
    }

    // 連線
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}

initParticles();
