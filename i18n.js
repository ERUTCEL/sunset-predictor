const TRANSLATIONS = {
  ko: {
    // 구름 레이어 라벨
    labelCloudHigh: '🌤️ 상층구름 (권운)',
    labelCloudMid:  '⛅ 중층구름',
    labelCloudLow:  '☁️ 하층구름',
    title:         '노을 예보 — 대한민국 붉은 노을 예측',
    h1:            '대한민국 노을 예보',
    subtitle:      '기후 조건(미세먼지 · 구름 · 습도 · 바람)을 분석하여<br>오늘 가장 아름다운 붉은 노을을 만날 수 있는지 예측합니다.',
    searchTitle:   '도시 선택',
    searchBtn:     '노을 예측하기',
    loading:       '날씨 데이터와 대기질을 불러오는 중…',
    todaySection:  '오늘의 노을 예측',
    scoreInit:     '예측 결과를 불러오는 중',
    sunsetLabel:   '오늘 일몰',
    sunsetSub:     'KST (한국 표준시)',
    goldenLabel:   '골든아워',
    goldenSub:     '일몰 전 1시간 · 최적 촬영 타임',
    statClouds:    '구름량',
    statHumidity:  '습도',
    statWind:      '풍속',
    statTemp:      '기온',
    breakdownTitle:'항목별 분석',
    labelAerosol:  '🌫️ 미세먼지',
    labelClouds:   '☁️ 구름량',
    labelHumidity: '💧 습도',
    labelWind:     '🌬️ 풍속',
    labelSeason:   '📅 계절',
    tipsTitle:     '📸 오늘의 촬영 팁',
    forecastTitle: '5일 노을 예보',
    algoTitle:     '🔬 예측 알고리즘 — 한국 기후 특성 반영',
    algoItems: [
      { title: '미세먼지 (PM2.5) · 20%', body: '대기 중 미세입자가 태양광을 산란시켜 붉은색을 만들어냅니다. 10~35 μg/m³이 최적, 너무 많으면 탁해집니다.' },
      { title: '상층구름 (권운) · 22%',  body: '8km 이상의 권운은 노을 빛을 받아 불타듯 붉게 물드는 핵심 요소입니다. 30~70%가 가장 화려한 노을을 만들어냅니다.' },
      { title: '중층구름 · 13%',         body: '3~8km 고도의 고적운·고층운은 오렌지·자주 색조를 담당합니다. 10~40%가 최적입니다.' },
      { title: '하층구름 · 5%',          body: '3km 이하의 층운·적운은 많으면 서쪽 지평선을 차단해 노을을 가립니다. 15% 이하가 이상적입니다.' },
      { title: '습도 · 18%',             body: '30~55%의 적당한 습도가 최적입니다. 습도가 높으면 안개처럼 흐릿해집니다.' },
      { title: '풍속 · 12%',             body: '1~5 m/s의 약한 바람이 오염물질을 적당히 분산시킵니다.' },
      { title: '계절 보정 · 10%',        body: '가을(9~10월)이 최고입니다. 봄·겨울도 준수하며, 여름 장마철에 점수가 낮아집니다.' },
    ],
    footer: '날씨·구름층 데이터: Open-Meteo (ECMWF/GFS 기반, 무료 오픈소스) &nbsp;·&nbsp; 대기질 데이터: Open-Meteo Air Quality API<br>일몰 시각은 천문 공식으로 계산됩니다 (±수 분 오차 가능)<br>예측은 기후 조건의 통계적 분석이며, 실제 노을과 다를 수 있습니다.',
    noData:  '데이터 없음',
    today:   '오늘',
    grades: [
      { grade: '최고', label: '환상적인 노을' },
      { grade: '좋음', label: '아름다운 노을' },
      { grade: '보통', label: '나쁘지 않은 노을' },
      { grade: '낮음', label: '흐릿한 노을' },
      { grade: '나쁨', label: '노을 기대 어려움' },
    ],
    tips: {
      tripod:    '📷 삼각대를 준비하세요. 골든아워 시작 30분 전부터 촬영 포지션을 잡으세요.',
      clouds:    '☁️ 상층 구름 분포가 이상적입니다. 권운이 빛을 받아 붉게 불타는 순간을 노리세요.',
      aerosol:   '✨ 대기 중 미세입자가 적당합니다. 태양 주변의 코로나 효과를 담아보세요.',
      haze:      '😷 미세먼지가 많아 노출을 -1~-2EV 조정하면 탁한 느낌을 줄일 수 있습니다.',
      humidity:  '💧 습도가 높아 수평선 근처에 안개층이 형성될 수 있습니다. 고각도 구도를 시도하세요.',
      lowCloud:  '🌫️ 하층 구름이 두꺼워 서쪽 지평선이 가릴 수 있습니다. 탁 트인 서쪽 방향을 찾아보세요.',
      exposure:  '🎨 노출을 -0.7EV로 설정하면 붉은 톤이 더 풍부하게 나옵니다.',
      wb:        '📱 화이트밸런스를 \'맑음(5500K)\'으로 고정하면 따뜻한 색조를 유지할 수 있습니다.',
      poor:      '⛅ 오늘은 노을 조건이 좋지 않습니다. 구름 틈새 빛기둥(Jacob\'s Ladder)을 노려보세요.',
    },
  },

  en: {
    // cloud layer labels
    labelCloudHigh: '🌤️ High Clouds (Cirrus)',
    labelCloudMid:  '⛅ Mid Clouds',
    labelCloudLow:  '☁️ Low Clouds',
    title:         'Sunset Forecast — Korea Red Sunset Predictor',
    h1:            'Korea Sunset Forecast',
    subtitle:      'Analyzing climate conditions (fine dust · clouds · humidity · wind)<br>to predict whether today will bring a beautiful red sunset.',
    searchTitle:   'Select City',
    searchBtn:     'Predict Sunset',
    loading:       'Loading weather and air quality data…',
    todaySection:  "Today's Sunset Forecast",
    scoreInit:     'Loading forecast…',
    sunsetLabel:   'Sunset Today',
    sunsetSub:     'KST (Korea Standard Time)',
    goldenLabel:   'Golden Hour',
    goldenSub:     '1 hour before sunset · Best shooting window',
    statClouds:    'Clouds',
    statHumidity:  'Humidity',
    statWind:      'Wind',
    statTemp:      'Temp',
    breakdownTitle:'Score Breakdown',
    labelAerosol:  '🌫️ Fine Dust',
    labelClouds:   '☁️ Clouds',
    labelHumidity: '💧 Humidity',
    labelWind:     '🌬️ Wind',
    labelSeason:   '📅 Season',
    tipsTitle:     '📸 Photo Tips for Today',
    forecastTitle: '5-Day Sunset Forecast',
    algoTitle:     '🔬 Prediction Algorithm — Korean Climate Factors',
    algoItems: [
      { title: 'Fine Dust (PM2.5) · 20%',   body: 'Fine particles scatter sunlight to create red hues. 10–35 μg/m³ is optimal; too much makes the sky hazy.' },
      { title: 'High Clouds (Cirrus) · 22%', body: 'Cirrus clouds above 8km are the main driver of dramatic red sunsets. 30–70% coverage is ideal.' },
      { title: 'Mid Clouds · 13%',           body: 'Altocumulus at 3–8km produce orange and purple hues. 10–40% is optimal.' },
      { title: 'Low Clouds · 5%',            body: 'Stratus below 3km can block the western horizon. Keep below 15% for clear views.' },
      { title: 'Humidity · 18%',             body: '30–55% humidity is optimal. High humidity causes a foggy, washed-out appearance.' },
      { title: 'Wind Speed · 12%',           body: 'Light winds of 1–5 m/s help disperse pollutants without scattering clouds too quickly.' },
      { title: 'Season Bonus · 10%',         body: 'Autumn (Sep–Oct) is the best season. Spring and winter are also solid; summer monsoon scores lowest.' },
    ],
    footer: 'Weather & cloud layer data: Open-Meteo (ECMWF/GFS, free & open-source) &nbsp;·&nbsp; Air quality: Open-Meteo Air Quality API<br>Sunset times are calculated via astronomical formula (±few minutes)<br>Predictions are statistical estimates and may differ from actual conditions.',
    noData:  'No data',
    today:   'Today',
    grades: [
      { grade: 'Excellent', label: 'Breathtaking Sunset' },
      { grade: 'Good',      label: 'Beautiful Sunset' },
      { grade: 'Fair',      label: 'Decent Sunset' },
      { grade: 'Low',       label: 'Faint Sunset' },
      { grade: 'Poor',      label: 'Unlikely Sunset' },
    ],
    tips: {
      tripod:    '📷 Set up a tripod. Find your composition 30 minutes before golden hour begins.',
      clouds:    '☁️ High cirrus clouds look ideal. Watch for the moment they ignite with red light.',
      aerosol:   '✨ Aerosol levels are just right. Try capturing the corona effect around the sun.',
      haze:      '😷 High fine dust — try -1 to -2EV exposure compensation to reduce the hazy look.',
      humidity:  '💧 High humidity may create a fog layer near the horizon. Try shooting from a higher angle.',
      lowCloud:  '🌫️ Low clouds may block the western horizon. Find an open view toward the west.',
      exposure:  '🎨 Set exposure to -0.7EV to bring out richer red tones.',
      wb:        '📱 Lock white balance to Daylight (5500K) to preserve warm tones.',
      poor:      "⛅ Sunset conditions are poor today. Look for Jacob's Ladder through cloud gaps instead.",
    },
  },

  zh: {
    // cloud layer labels
    labelCloudHigh: '🌤️ 高层云 (卷云)',
    labelCloudMid:  '⛅ 中层云',
    labelCloudLow:  '☁️ 低层云',
    title:         '晚霞预报 — 韩国红色晚霞预测',
    h1:            '韩国晚霞预报',
    subtitle:      '通过分析气候条件（细颗粒物 · 云量 · 湿度 · 风速）<br>预测今天是否能看到美丽的红色晚霞。',
    searchTitle:   '选择城市',
    searchBtn:     '预测晚霞',
    loading:       '正在加载天气和空气质量数据…',
    todaySection:  '今日晚霞预测',
    scoreInit:     '正在加载预测结果…',
    sunsetLabel:   '今日日落',
    sunsetSub:     'KST（韩国标准时间）',
    goldenLabel:   '黄金时段',
    goldenSub:     '日落前1小时 · 最佳拍摄时间',
    statClouds:    '云量',
    statHumidity:  '湿度',
    statWind:      '风速',
    statTemp:      '气温',
    breakdownTitle:'分项分析',
    labelAerosol:  '🌫️ 细颗粒物',
    labelClouds:   '☁️ 云量',
    labelHumidity: '💧 湿度',
    labelWind:     '🌬️ 风速',
    labelSeason:   '📅 季节',
    tipsTitle:     '📸 今日拍摄技巧',
    forecastTitle: '5天晚霞预报',
    algoTitle:     '🔬 预测算法 — 融合韩国气候特征',
    algoItems: [
      { title: '细颗粒物 (PM2.5) · 20%', body: '大气中的微粒散射阳光，形成红色色调。10~35 μg/m³为最佳，过多会导致天空混浊。' },
      { title: '高层云 (卷云) · 22%',    body: '8km以上的卷云是晚霞绚烂的核心，被夕阳点燃后呈现壮丽的红色。30~70%最为理想。' },
      { title: '中层云 · 13%',           body: '3~8km的高积云负责橙色和紫色色调，10~40%为最佳。' },
      { title: '低层云 · 5%',            body: '3km以下的层云会遮挡西方地平线，建议保持在15%以下。' },
      { title: '湿度 · 18%',             body: '30~55%的湿度最为适宜，湿度过高会导致天空像雾一样模糊。' },
      { title: '风速 · 12%',             body: '1~5 m/s的微风有助于分散污染物，同时不会过快驱散云层。' },
      { title: '季节修正 · 10%',         body: '秋季（9~10月）是最佳季节。春冬也不错，夏季梅雨期得分最低。' },
    ],
    footer: '天气·云层数据：Open-Meteo（基于ECMWF/GFS，免费开源）&nbsp;·&nbsp; 空气质量：Open-Meteo Air Quality API<br>日落时间通过天文公式计算（误差±数分钟）<br>预测基于统计分析，实际晚霞可能有所不同。',
    noData:  '无数据',
    today:   '今天',
    grades: [
      { grade: '极佳', label: '绝美晚霞' },
      { grade: '良好', label: '美丽晚霞' },
      { grade: '一般', label: '普通晚霞' },
      { grade: '较差', label: '晚霞较暗' },
      { grade: '差',   label: '几乎无晚霞' },
    ],
    tips: {
      tripod:    '📷 请准备三脚架，在黄金时段开始前30分钟确定好拍摄位置。',
      clouds:    '☁️ 高层卷云分布理想，等待云彩被夕阳点燃变红的瞬间。',
      aerosol:   '✨ 大气微粒适量，可尝试捕捉太阳周围的日冕效果。',
      haze:      '😷 细颗粒物较多，将曝光补偿调至-1~-2EV可减少朦胧感。',
      humidity:  '💧 湿度较高，地平线附近可能出现雾层，建议尝试高角度构图。',
      lowCloud:  '🌫️ 低层云较厚，可能遮挡西方地平线，请寻找向西的开阔视野。',
      exposure:  '🎨 将曝光设为-0.7EV，可使红色调更加浓郁。',
      wb:        '📱 将白平衡锁定为晴天（5500K），可保持温暖色调。',
      poor:      '⛅ 今日晚霞条件不佳，可尝试捕捉云隙中的丁达尔光线。',
    },
  },
};

let currentLang = localStorage.getItem('lang') || 'ko';

function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS['ko'][key];
}

function applyLang() {
  const lang = currentLang;
  const T = TRANSLATIONS[lang];

  document.documentElement.lang = lang;
  document.title = T.title;

  document.querySelector('header h1').textContent = T.h1;
  document.querySelector('header p').innerHTML = T.subtitle;
  document.querySelector('.search-panel h2').textContent = T.searchTitle;
  document.getElementById('search-btn').textContent = T.searchBtn;
  document.querySelector('#loading span').textContent = T.loading;
  document.querySelector('#current-section .section-title').textContent = T.todaySection;
  document.getElementById('score-label').textContent = T.scoreInit;
  document.querySelector('.time-block:nth-child(1) .time-label').textContent = T.sunsetLabel;
  document.querySelector('.time-block:nth-child(1) .time-sub').textContent = T.sunsetSub;
  document.querySelector('.time-block:nth-child(2) .time-label').textContent = T.goldenLabel;
  document.querySelector('.time-block:nth-child(2) .time-sub').textContent = T.goldenSub;

  // stat labels
  const statLabels = document.querySelectorAll('.stat-label');
  statLabels[2].textContent = T.statClouds;
  statLabels[3].textContent = T.statHumidity;
  statLabels[4].textContent = T.statWind;
  statLabels[5].textContent = T.statTemp;

  document.querySelector('.breakdown-card .section-title').textContent = T.breakdownTitle;
  const bdLabels = document.querySelectorAll('.breakdown-label');
  bdLabels[0].textContent  = T.labelAerosol;
  bdLabels[1].innerHTML    = `${T.labelCloudHigh} <small>(권운·8km+)</small>`;
  bdLabels[2].innerHTML    = `${T.labelCloudMid}  <small>(3~8km)</small>`;
  bdLabels[3].innerHTML    = `${T.labelCloudLow}  <small>(3km-)</small>`;
  bdLabels[4].textContent  = T.labelHumidity;
  bdLabels[5].textContent  = T.labelWind;
  bdLabels[6].textContent  = T.labelSeason;

  document.querySelector('.tips-card .section-title').textContent = T.tipsTitle;
  document.querySelector('#forecast-section .section-title').textContent = T.forecastTitle;

  document.querySelector('.algo-info h3').textContent = T.algoTitle;
  const algoItems = document.querySelectorAll('.algo-item');
  T.algoItems.forEach((item, i) => {
    if (algoItems[i]) {
      algoItems[i].innerHTML = `<strong>${item.title}</strong>${item.body}`;
    }
  });

  document.querySelector('footer').innerHTML = T.footer;

  // 언어 버튼 active 상태
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyLang();
}
