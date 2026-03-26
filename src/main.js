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

import { getMonthGeneral } from './engine/monthGeneral.js';
import { getFourPillars } from './engine/stemBranch.js';
import { getEscapeDirections } from './engine/directions.js';
import { assessPillarInteraction } from './engine/stemRelation.js';
import { evaluateEnergy } from './engine/wuxing.js';
import { getKongWang, isJieLuKongWang, getNoblemanBranches } from './engine/constants.js';
import { generateMasterVerdict } from './engine/masterVerdict.js';

// 容器
const inputContainer = document.getElementById('input-area');
const palaceContainer = document.getElementById('palace-area');
const stemContainer = document.getElementById('stem-area');
const energyContainer = document.getElementById('energy-area');
const verdictContainer = document.getElementById('master-verdict-area');
const resultContainer = document.getElementById('result-area');

// 初始化輸入元件
createDateTimeInput(inputContainer, onCalculate);

/**
 * 主計算函式 — 當使用者點擊「開始占卜」時觸發
 */
function onCalculate(date) {
  try {
    // 1. 計算四柱干支
    const fourPillars = getFourPillars(date);

    // 2. 計算月將
    const monthGeneralInfo = getMonthGeneral(date);

    // 3. 計算方位 (月將加時)
    const hourBranch = fourPillars.hour.branch;
    const escapeDirections = getEscapeDirections(monthGeneralInfo.monthGeneral, hourBranch);

    // 4. 日時生剋與地支互動
    const stemInteraction = assessPillarInteraction(fourPillars.day, fourPillars.hour);

    // 5. 五星能量
    const energyResult = evaluateEnergy(
      fourPillars.day.stem,
      fourPillars.hour.stem,
      monthGeneralInfo.lunarMonth
    );

    // 6. 進階斷法 (空亡、截路空亡、天乙貴人)
    const kongWang = getKongWang(fourPillars.day.stem, fourPillars.day.branch);
    const isJieLu = isJieLuKongWang(fourPillars.day.stem, hourBranch);
    const noblemen = getNoblemanBranches(fourPillars.day.stem);

    const advancedData = {
      kongWang,
      isJieLu,
      noblemen
    };

    // 7. 生成大師總評
    const masterVerdict = generateMasterVerdict(
      stemInteraction,
      energyResult,
      advancedData,
      escapeDirections
    );

    // 渲染結果 (帶交錯動畫)
    createNinePalaceGrid(palaceContainer, escapeDirections, stemInteraction, advancedData);

    setTimeout(() => {
      createStemRelator(stemContainer, stemInteraction);
    }, 150);

    setTimeout(() => {
      createEnergyMeter(energyContainer, energyResult);
    }, 300);

    setTimeout(() => {
      createMasterVerdictPanel(verdictContainer, masterVerdict);
    }, 450);

    setTimeout(() => {
      createResultPanel(resultContainer, {
        fourPillars,
        monthGeneralInfo,
        date,
      });
    }, 600);

    // 滾動到結果
    setTimeout(() => {
      palaceContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

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
