import { ZHI_TO_PALACE, PALACE_DIRECTIONS } from './constants.js';

/**
 * 根據所有算出的盤面資料，生成一段大師建言
 */
export function generateMasterVerdict(
  stemInteraction,
  energyResult,
  advancedData,
  escapeDirections
) {
  let title = '';
  let color = '#fff';
  let lines = [];

  const { relation, verdict, branchRelation, dayInfo } = stemInteraction;
  const { isJieLu, kongWang, noblemen } = advancedData;
  const dayPalace = dayInfo.palace;
  const isDayPalaceVoid = kongWang.some(z => ZHI_TO_PALACE[z] === dayPalace);
  const energyScore = (energyResult.score || 0) * 100;

  // ---------------------------------------------------------
  // 1. 底色判斷 (生剋 + 能量)
  // ---------------------------------------------------------
  let baseTone = '';
  if (relation === 'generate' || relation === 'overcomed') {
    baseTone = energyScore > 70 ? '實力雄厚，勢如破竹' : '主動權在握，漸入佳境';
    color = '#4ade80';
  } else if (relation === 'overcome') {
    baseTone = energyScore > 70 ? '雖有實力，阻力重重' : '環境膠著，步步為營';
    color = '#f87171';
  } else {
    baseTone = energyScore > 70 ? '蓄勢待發，平穩中見機' : '局勢平穩，事在人為';
    color = '#60a5fa';
  }

  // ---------------------------------------------------------
  // 2. 狀態修正 (禁忌與限制)
  // ---------------------------------------------------------
  if (isJieLu) {
    title = '⛔ 諸事不宜，切勿妄動';
    color = '#f87171';
    lines.push('【最凶警告】當前時辰逢「截路空亡」，時間磁場斷裂。此時起行、周旋皆易成空。即使能量再旺，也會被「強行攔截」，【強烈建議按兵不動】。');
  } else if (isDayPalaceVoid) {
    // 解決 90% 能量卻顯示「氣場耗弱」的矛盾
    if (energyScore > 70) {
      title = '⚠️ 勢強落空，虛不受補';
      color = '#fbbf24';
      lines.push(`你自身能量極旺 (${energyScore}%)，但目前落入「空亡」之境，猶如英雄無用武之地。目前大勢看似大好，實則「虛而不實」，宜靜觀其變，不宜強攻。`);
    } else {
      title = '⚠️ 氣場耗弱，禍不單行';
      color = '#fbbf24';
      lines.push('自身落宮「空亡」且能量不足。這代表你目前狀態不佳、資源匱乏。凡事宜守不宜進，避免輕易做出重大承諾或決策。');
    }
  } else {
    // 正常情況
    title = `⚖️ ${baseTone}`;
    lines.push(`大局${verdict}。當前五行能量為 ${energyScore}%，${energyScore > 70 ? '自身氣場強盛，有能力主導局面。' : '狀態中庸，需謹慎佈局。'}`);
  }

  // ---------------------------------------------------------
  // 3. 細節微調 (地支沖合)
  // ---------------------------------------------------------
  if (!isJieLu && branchRelation) {
    if (branchRelation.type === 'liuchong') {
      title = `🚨 暗流湧動 | ${title.split(' ').pop()}`;
      color = '#ef4444';
      lines.push('【注意！】本局地支相沖，代表內部利益衝突嚴重或隨時有翻臉生變的危險。即便整體看起來吉利，也要嚴防核心團隊或計畫內容的「破局」。');
    } else if (branchRelation.type === 'liuhe') {
      title = `🤝 暗有助益 | ${title.split(' ').pop()}`;
      lines.push('且地支六合，代表私底下有共同利益或貴人暗盤推動，成功率比表面看起來更高！');
    }
  }

  // 2. 尋找最佳突破口/避難所
  // 找出三個泊地方位中，哪一個沒有落入空亡，且最好有貴人
  let bestEscape = null;
  let backupEscape = null;
  const escapes = [];
  if (escapeDirections.taiChong) escapes.push({ name: '太沖', zhi: '卯', palace: escapeDirections.taiChong.palace });
  if (escapeDirections.xiaoJi) escapes.push({ name: '小吉', zhi: '未', palace: escapeDirections.xiaoJi.palace });
  if (escapeDirections.congKui) escapes.push({ name: '從魁', zhi: '酉', palace: escapeDirections.congKui.palace });

  escapes.forEach(es => {
    const isVoid = kongWang.some(z => ZHI_TO_PALACE[z] === es.palace);
    const hasNoble = noblemen.some(z => ZHI_TO_PALACE[z] === es.palace);
    if (!isVoid) {
      if (hasNoble) {
        bestEscape = es;
      } else if (!backupEscape) {
        backupEscape = es;
      }
    }
  });

  const chosenEscape = bestEscape || backupEscape;
  
  if (chosenEscape) {
    const isNoble = bestEscape ? true : false;
    const dirName = PALACE_DIRECTIONS[chosenEscape.palace];
    lines.push(`👉 **突圍方位**：若遇不順或急需尋找出口，請立刻往**【${dirName}方 (${chosenEscape.palace})】**行動或尋求支援。那裡是安全的${chosenEscape.name}吉方${isNoble ? '，且帶有天乙貴人相助，最能逢凶化吉！' : '，能避開當前凶波。'}`);
  } else {
    lines.push('👉 **突圍方位**：目前所有吉方皆被空亡覆蓋，猶如求救無門。請盡可能按兵不動，靜待時機轉變。');
  }

  return { title, color, lines };
}
