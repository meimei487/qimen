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
  const { isJieLu, kongWang, noblemen, dayStemTombPalace } = advancedData;
  const dayPalace = dayInfo.palace;
  const isDayPalaceVoid = kongWang.some(z => ZHI_TO_PALACE[z] === dayPalace);
  const isDayStemTomb = (dayStemTombPalace === dayPalace);
  const energyScore = energyResult.overall?.percent || 0;

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
  // 2. 狀態修正 (禁忌與限制) - 加入「戰術預視」
  // ---------------------------------------------------------
  if (isJieLu) {
    title = '⛔ 諸事不宜，切勿妄動';
    color = '#f87171';
    lines.push('【最凶警告】當前時辰逢「截路空亡」，時間磁場斷裂。此時起行、周旋皆易成空。即使能量再旺，也會被「強行攔截」，【強烈建議按兵不動】。');
  } else {
    // 預設標題與狀態
    title = `⚖️ ${baseTone}`;
    
    // 自身狀態診斷
    if (isDayStemTomb) {
      title = '⚠️ 氣血入墓，有志難伸';
      color = '#fbbf24';
      lines.push('【現狀診斷】您目前正處於「入墓」宮位，代表受困、被動或能量被掩埋。即使外部環境再好，短期內也難以發揮實力。宜低調自保。');
    } else if (isDayPalaceVoid) {
      title = '⚠️ 勢強落空，虛不受補';
      color = '#fbbf24';
      lines.push(`【現狀診斷】您自身能量為 ${energyScore}%，但落入「空亡」之境。目前看似大好，實則「虛而不實」，宜靜觀其變，避免強攻。`);
    } else {
      lines.push(`【現狀診斷】大局${verdict}。當前五行能量為 ${energyScore}%，${energyScore > 50 ? '氣場充盈，足以應對變局。' : '能量低迷，行事宜保守。'}`);
    }

    // 戰術預視 (戰略性提示)
    if (dayStemTombPalace && !isDayStemTomb) {
      const tombDir = PALACE_DIRECTIONS[dayStemTombPalace];
      lines.push(`💡 **戰術預視**：注意方位的 **${tombDir}** 為您的墓庫之地。若無隱匿需求，請盡量避開該方位，以免陷入膠著。`);
    }
    
    if (isDayPalaceVoid || isDayStemTomb) {
      lines.push('💡 **戰略兵法**：此宮位對求事不利，但若需「避難、隱蹤、逃避」，此處反而是絕佳的「匿蹤之所」。');
    }
  }

  // ---------------------------------------------------------
  // 3. 細節微調 (地支沖合)
  // ---------------------------------------------------------
  if (!isJieLu && branchRelation) {
    if (branchRelation.type === 'liuchong') {
      title = `🚨 局逢六沖，必有劇變 | ${title.split(' ').pop()}`;
      color = '#ef4444';
      lines.push('【突發警告】本局地支相沖，局勢散亂。代表事情會有出乎意料的「突發改變」或「快速散夥」。利於逃脫困境 (逢沖則散)，但不利於長線經營。');
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
