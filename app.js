// ===== 한국 주요 도시 목록 =====
const KOREAN_CITIES = [
  { name: "서울", lat: 37.5665, lon: 126.9780 },
  { name: "부산", lat: 35.1796, lon: 129.0756 },
  { name: "인천", lat: 37.4563, lon: 126.7052 },
  { name: "대구", lat: 35.8714, lon: 128.6014 },
  { name: "대전", lat: 36.3504, lon: 127.3845 },
  { name: "광주", lat: 35.1595, lon: 126.8526 },
  { name: "울산", lat: 35.5384, lon: 129.3114 },
  { name: "제주", lat: 33.4996, lon: 126.5312 },
  { name: "강릉", lat: 37.7519, lon: 128.8761 },
  { name: "전주", lat: 35.8242, lon: 127.1480 },
  { name: "춘천", lat: 37.8813, lon: 127.7298 },
  { name: "수원", lat: 37.2636, lon: 127.0286 },
  { name: "청주", lat: 36.6424, lon: 127.4890 },
  { name: "여수", lat: 34.7604, lon: 127.6622 },
  { name: "포항", lat: 36.0190, lon: 129.3435 },
];

// ===== 노을 품질 예측 알고리즘 =====
// 대한민국 기후 특성 반영:
// - 봄: 황사 (PM10 높음) → 노을 강렬하지만 뿌옇게 보일 수 있음
// - 여름: 높은 습도, 장마 → 구름이 많아 산란광 아름다움
// - 가을: 맑고 건조 → 가장 선명한 노을
// - 겨울: 건조하고 미세먼지 → 붉은 노을

/**
 * PM2.5 기반 에어로졸 점수 (0~30)
 * 미세입자가 태양광을 산란시켜 노을 색을 만들어냄
 * 너무 적으면 밋밋, 너무 많으면 탁해짐
 */
function scoreAerosol(pm25) {
  if (pm25 === null || pm25 === undefined) return 15;
  if (pm25 < 5)  return 10;   // 너무 깨끗 → 색이 밋밋
  if (pm25 < 15) return 28;   // 최적 (맑은 날 약간의 입자)
  if (pm25 < 35) return 25;   // 양호
  if (pm25 < 55) return 15;   // 보통 (약간 탁함)
  if (pm25 < 75) return 8;    // 나쁨 (탁해서 노을이 흐릿)
  return 3;                    // 매우 나쁨
}

/**
 * 구름량 점수 (0~30)
 * 구름이 없으면 심심, 완전 흐리면 빛이 안 들어옴
 * 20~60% 산재한 구름이 가장 아름다운 노을 만들어냄
 */
function scoreClouds(cloudPercent) {
  if (cloudPercent < 5)  return 12;  // 무구름 → 단조로움
  if (cloudPercent < 20) return 22;  // 약간의 구름
  if (cloudPercent < 45) return 30;  // 최적 (산란 구름)
  if (cloudPercent < 65) return 25;  // 양호
  if (cloudPercent < 80) return 14;  // 구름 많음
  return 5;                          // 흐림 → 빛 차단
}

/**
 * 습도 점수 (0~20)
 * 적당한 습도는 산란 도움, 너무 높으면 안개처럼 흐릿해짐
 */
function scoreHumidity(humidity) {
  if (humidity < 30) return 12;   // 너무 건조
  if (humidity < 55) return 20;   // 최적
  if (humidity < 70) return 16;   // 양호
  if (humidity < 85) return 8;    // 다소 높음
  return 4;                        // 너무 높음 (안개 가능성)
}

/**
 * 풍속 점수 (0~10)
 * 적당한 바람은 오염물질 분산, 너무 강하면 구름 흩어짐
 */
function scoreWind(windSpeed) {
  if (windSpeed < 1)  return 5;   // 무풍 → 오염 정체
  if (windSpeed < 5)  return 10;  // 최적
  if (windSpeed < 10) return 8;   // 양호
  if (windSpeed < 15) return 5;   // 구름 빠르게 이동
  return 3;                        // 강풍
}

/**
 * 계절 보정 점수 (0~10)
 * 한국 계절별 기후 특성 반영
 */
function scoreSeason(month) {
  if (month === 9 || month === 10) return 10; // 가을: 최고
  if (month === 11 || month === 3) return 8;  // 늦가을/초봄
  if (month === 12 || month === 1) return 7;  // 겨울 (건조)
  if (month === 2)                 return 6;  // 겨울 끝
  if (month === 4)                 return 5;  // 봄 (황사 시작)
  if (month === 5)                 return 7;  // 봄 끝
  if (month === 6)                 return 5;  // 장마 전
  if (month === 7 || month === 8)  return 4;  // 여름 (장마, 높은 습도)
  return 5;
}

/**
 * 종합 노을 품질 점수 계산 (0~100)
 */
function calculateSunsetScore(weather) {
  const { pm25, clouds, humidity, windSpeed, month } = weather;

  const s_aerosol  = scoreAerosol(pm25);      // 최대 30
  const s_clouds   = scoreClouds(clouds);      // 최대 30
  const s_humidity = scoreHumidity(humidity);  // 최대 20
  const s_wind     = scoreWind(windSpeed);     // 최대 10
  const s_season   = scoreSeason(month);       // 최대 10

  const total = s_aerosol + s_clouds + s_humidity + s_wind + s_season;

  return {
    total: Math.min(100, Math.round(total)),
    breakdown: { s_aerosol, s_clouds, s_humidity, s_wind, s_season }
  };
}

/**
 * 점수에 따른 등급 및 색상
 */
function getGrade(score) {
  if (score >= 85) return { grade: "최고", label: "환상적인 노을", color: "#FF4500", emoji: "🌅" };
  if (score >= 70) return { grade: "좋음", label: "아름다운 노을", color: "#FF7F00", emoji: "🧡" };
  if (score >= 55) return { grade: "보통", label: "나쁘지 않은 노을", color: "#FFA500", emoji: "🌤️" };
  if (score >= 40) return { grade: "낮음", label: "흐릿한 노을", color: "#FFD700", emoji: "🌥️" };
  return { grade: "나쁨", label: "노을 기대 어려움", color: "#A9A9A9", emoji: "☁️" };
}

// ===== 일몰 시각 계산 =====
// Astronomical algorithm (Spencer/Cooper)
function calcSunsetTime(lat, lon, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const declination = 23.45 * Math.sin(B) * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;
  const hourAngle = Math.acos(cosHourAngle) * (180 / Math.PI);
  const solarNoon = 12 - (lon - 135) / 15 - EoT / 60; // KST (UTC+9, 135°E 기준)
  const sunset = solarNoon + hourAngle / 15;
  const h = Math.floor(sunset);
  const m = Math.round((sunset - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function calcGoldenHour(lat, lon, date) {
  const sunset = calcSunsetTime(lat, lon, date);
  if (!sunset) return null;
  const [h, m] = sunset.split(':').map(Number);
  const totalMin = h * 60 + m;
  const startMin = totalMin - 60;
  const sh = Math.floor(startMin / 60);
  const sm = startMin % 60;
  return `${sh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')} ~ ${sunset}`;
}

// ===== 촬영 팁 생성 =====
function getPhotoTips(weather, score) {
  const tips = [];
  const { pm25, clouds, humidity } = weather;

  if (score.total >= 70) {
    tips.push("📷 삼각대를 준비하세요. 골든아워 시작 30분 전부터 촬영 포지션을 잡으세요.");
  }
  if (clouds >= 20 && clouds <= 60) {
    tips.push("☁️ 구름 분포가 이상적입니다. 구름이 빛을 받아 붉게 물드는 순간을 노리세요.");
  }
  if (pm25 >= 10 && pm25 <= 35) {
    tips.push("✨ 대기 중 미세입자가 적당합니다. 태양 주변의 코로나 효과를 담아보세요.");
  }
  if (pm25 > 55) {
    tips.push("😷 미세먼지가 많아 노출을 -1~-2EV 조정하면 탁한 느낌을 줄일 수 있습니다.");
  }
  if (humidity > 70) {
    tips.push("💧 습도가 높아 수평선 근처에 안개층이 형성될 수 있습니다. 고각도 구도를 시도하세요.");
  }
  if (score.total >= 55) {
    tips.push("🎨 노출을 -0.7EV로 설정하면 붉은 톤이 더 풍부하게 나옵니다.");
    tips.push("📱 화이트밸런스를 '맑음(5500K)'으로 고정하면 따뜻한 색조를 유지할 수 있습니다.");
  }
  if (tips.length === 0) {
    tips.push("⛅ 오늘은 노을 조건이 좋지 않습니다. 구름 틈새 빛기둥(Jacob's Ladder)을 노려보세요.");
  }
  return tips;
}

// ===== API 호출 (Netlify Function 프록시) =====
function apiUrl(endpoint, lat, lon) {
  return `/api/weather?endpoint=${endpoint}&lat=${lat}&lon=${lon}`;
}

async function fetchWeatherAndAQ(lat, lon) {
  let weatherRes, aqRes, forecastRes;
  try {
    [weatherRes, aqRes, forecastRes] = await Promise.all([
      fetch(apiUrl('weather', lat, lon)),
      fetch(apiUrl('air_pollution', lat, lon)),
      fetch(apiUrl('forecast', lat, lon)),
    ]);
  } catch (e) {
    throw new Error('네트워크 오류: 인터넷 연결을 확인해주세요.');
  }

  if (!weatherRes.ok) {
    const err = await weatherRes.json().catch(() => ({}));
    const code = weatherRes.status;
    if (code === 500) throw new Error('서버 설정 오류: 관리자에게 문의해주세요.');
    if (code === 429) throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    throw new Error(`날씨 데이터 오류 (${code}): ${err.message || '알 수 없는 오류'}`);
  }

  const weather = await weatherRes.json();
  const aq = await aqRes.json();
  const forecast = await forecastRes.json();

  return { weather, aq, forecast };
}

/**
 * 예보 데이터에서 날짜별 일몰 시간대(17~20시) 데이터 추출
 */
function extractDailyForecast(forecastData, lat, lon) {
  const dailyMap = {};

  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
    const hour = date.getHours();

    // 일몰 전후 시간대 (15~20시) 데이터 우선 사용
    if (!dailyMap[dateStr] || (hour >= 15 && hour <= 20)) {
      dailyMap[dateStr] = {
        dateStr,
        date,
        clouds: item.clouds.all,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        month: date.getMonth() + 1,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        pm25: null, // 예보에는 대기질 미포함 → 현재 대기질 참고값 사용
      };
    }
  });

  return Object.values(dailyMap).slice(0, 5);
}

// ===== 상태 관리 =====
let state = {
  selectedCity: KOREAN_CITIES[0],
  currentData: null,
  forecastData: [],
  loading: false,
  error: null,
};

// ===== DOM 렌더링 =====
function renderCitySelector() {
  const sel = document.getElementById('city-select');
  sel.innerHTML = KOREAN_CITIES.map(c =>
    `<option value="${c.lat},${c.lon}" ${c.name === state.selectedCity.name ? 'selected' : ''}>${c.name}</option>`
  ).join('');
}

function renderCurrentConditions(weather, aq, lat, lon) {
  const pm25 = aq?.list?.[0]?.components?.pm2_5 ?? null;
  const pm10 = aq?.list?.[0]?.components?.pm10 ?? null;
  const clouds = weather.clouds.all;
  const humidity = weather.main.humidity;
  const windSpeed = weather.wind.speed;
  const month = new Date().getMonth() + 1;

  const scoreResult = calculateSunsetScore({ pm25, clouds, humidity, windSpeed, month });
  const grade = getGrade(scoreResult.total);
  const tips = getPhotoTips({ pm25, clouds, humidity, windSpeed }, scoreResult);
  const today = new Date();
  const sunsetTime = calcSunsetTime(lat, lon, today);
  const goldenHour = calcGoldenHour(lat, lon, today);

  // 점수 링 애니메이션
  const ring = document.getElementById('score-ring');
  const scoreNum = document.getElementById('score-number');
  const scoreLabel = document.getElementById('score-label');
  const gradeEl = document.getElementById('score-grade');

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (scoreResult.total / 100) * circumference;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = grade.color;
  scoreNum.textContent = scoreResult.total;
  scoreNum.style.color = grade.color;
  scoreLabel.textContent = grade.label;
  gradeEl.textContent = `${grade.emoji} ${grade.grade}`;
  gradeEl.style.color = grade.color;

  // 일몰 시각
  document.getElementById('sunset-time').textContent = sunsetTime || '--:--';
  document.getElementById('golden-hour').textContent = goldenHour || '--:-- ~ --:--';

  // 날씨 상세
  document.getElementById('stat-pm25').textContent = pm25 !== null ? `${pm25.toFixed(1)} μg/m³` : '데이터 없음';
  document.getElementById('stat-pm10').textContent = pm10 !== null ? `${pm10.toFixed(1)} μg/m³` : '데이터 없음';
  document.getElementById('stat-clouds').textContent = `${clouds}%`;
  document.getElementById('stat-humidity').textContent = `${humidity}%`;
  document.getElementById('stat-wind').textContent = `${windSpeed.toFixed(1)} m/s`;
  document.getElementById('stat-temp').textContent = `${weather.main.temp.toFixed(1)}°C`;

  // 점수 세부 분석
  const bd = scoreResult.breakdown;
  renderBreakdownBar('bar-aerosol', bd.s_aerosol, 30, grade.color);
  renderBreakdownBar('bar-clouds', bd.s_clouds, 30, grade.color);
  renderBreakdownBar('bar-humidity', bd.s_humidity, 20, grade.color);
  renderBreakdownBar('bar-wind', bd.s_wind, 10, grade.color);
  renderBreakdownBar('bar-season', bd.s_season, 10, grade.color);

  // 촬영 팁
  const tipsEl = document.getElementById('photo-tips');
  tipsEl.innerHTML = tips.map(t => `<li>${t}</li>`).join('');

  // 현재 날씨 설명
  document.getElementById('weather-desc').textContent =
    `${weather.name} · ${weather.weather[0].description} · ${weather.main.temp.toFixed(1)}°C`;

  document.getElementById('current-section').style.display = 'block';
}

function renderBreakdownBar(id, value, max, color) {
  const el = document.getElementById(id);
  if (!el) return;
  const pct = Math.round((value / max) * 100);
  el.style.width = pct + '%';
  el.style.background = color;
  const pctEl = document.getElementById(id.replace('bar-', 'pct-'));
  if (pctEl) pctEl.textContent = pct + '%';
}

function renderForecast(forecastItems, lat, lon, currentPm25) {
  const container = document.getElementById('forecast-cards');
  container.innerHTML = '';

  forecastItems.forEach((item, i) => {
    const pm25 = currentPm25 !== null ? currentPm25 * (0.9 + Math.random() * 0.2) : null; // 예보 대기질 근사치
    const weather = { ...item, pm25 };
    const scoreResult = calculateSunsetScore(weather);
    const grade = getGrade(scoreResult.total);
    const sunsetTime = calcSunsetTime(lat, lon, item.date);
    const isToday = i === 0;

    const card = document.createElement('div');
    card.className = `forecast-card ${isToday ? 'today' : ''}`;
    card.style.setProperty('--grade-color', grade.color);
    card.innerHTML = `
      <div class="forecast-date">${isToday ? '오늘' : item.dateStr}</div>
      <div class="forecast-emoji">${grade.emoji}</div>
      <div class="forecast-score" style="color:${grade.color}">${scoreResult.total}<span>%</span></div>
      <div class="forecast-grade" style="color:${grade.color}">${grade.grade}</div>
      <div class="forecast-sunset">🌅 ${sunsetTime || '--:--'}</div>
      <div class="forecast-desc">${item.description}</div>
      <div class="forecast-bars">
        <div class="mini-bar-row">
          <span>구름</span>
          <div class="mini-bar"><div style="width:${item.clouds}%;background:${grade.color}"></div></div>
        </div>
        <div class="mini-bar-row">
          <span>습도</span>
          <div class="mini-bar"><div style="width:${item.humidity}%;background:${grade.color}"></div></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('forecast-section').style.display = 'block';
}

async function loadData() {
  setLoading(true);
  clearError();

  try {
    const { lat, lon } = state.selectedCity;
    const { weather, aq, forecast } = await fetchWeatherAndAQ(lat, lon);

    const pm25 = aq?.list?.[0]?.components?.pm2_5 ?? null;
    const dailyForecast = extractDailyForecast(forecast, lat, lon);

    renderCurrentConditions(weather, aq, lat, lon);
    renderForecast(dailyForecast, lat, lon, pm25);

    state.currentData = { weather, aq };
    state.forecastData = dailyForecast;
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function setLoading(val) {
  state.loading = val;
  document.getElementById('loading').style.display = val ? 'flex' : 'none';
  document.getElementById('search-btn').disabled = val;
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  const el = document.getElementById('error-msg');
  el.style.display = 'none';
}

// ===== 이벤트 바인딩 =====
document.addEventListener('DOMContentLoaded', () => {
  renderCitySelector();

  document.getElementById('city-select').addEventListener('change', e => {
    const [lat, lon] = e.target.value.split(',').map(Number);
    state.selectedCity = KOREAN_CITIES.find(c => c.lat === lat && c.lon === lon);
  });

  document.getElementById('search-btn').addEventListener('click', loadData);

  loadData();
});
