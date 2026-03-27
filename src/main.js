import { createDateTimeInput } from './components/DateTimeInput.js';
import { createEnergyMeter } from './components/EnergyMeter.js';
import { createStemRelator } from './components/StemRelator.js';
import { createResultPanel } from './components/ResultPanel.js';
import { createNinePalaceGrid, createWarningPanel, createEscapePanel, createStatusPanel } from './components/NinePalaceGrid.js';

import { getFourPillars } from './engine/stemBranch.js';
import { getMonthGeneral } from './engine/monthGeneral.js';
import { evaluateEnergy } from './engine/wuxing.js';
import { getKongWang, isJieLuKongWang, getNoblemanBranches, ZHI_TO_PALACE, getTombBranch } from './engine/constants.js';
import { assessPillarInteraction } from './engine/stemRelation.js';
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
      createWarningPanel(warningArea, hourBranch, advancedData);
    }, 150);

    // 3. 泊地方位 (出口)
    setTimeout(() => {
      createEscapePanel(escapeArea, escapeDirections);
    }, 300);

    // 4. 日時生剋 (關係)
    setTimeout(() => {
      createStemRelator(stemArea, stemInteraction);
    }, 450);

    // 5. 貴人/空亡 (診斷)
    setTimeout(() => {
      createStatusPanel(statusArea, advancedData);
    }, 600);

    // 6. 九宮星圖 (地圖)
    setTimeout(() => {
      createNinePalaceGrid(palaceArea, escapeDirections, stemInteraction, advancedData);
    }, 750);

    // 7. 大師總評 (指引)
    setTimeout(() => {
      import('./components/MasterVerdictPanel.js').then(m => m.createMasterVerdictPanel(verdictArea, masterVerdict));
    }, 900);

    // 8. 詳細資訊 (數據)
    setTimeout(() => {
      createResultPanel(resultArea, { fourPillars, monthGeneralInfo, date });
    }, 1050);

  } catch (error) {
    console.error('計算錯誤:', error);
  }
}
