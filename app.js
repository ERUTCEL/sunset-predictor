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

// ===== WMO 날씨 코드 변환 =====
const WMO_DESCRIPTIONS = {
  0: '맑음', 1: '대체로 맑음', 2: '부분 흐림', 3: '흐림',
  45: '안개', 48: '서리 안개',
  51: '약한 이슬비', 53: '이슬비', 55: '강한 이슬비',
  61: '약한 비', 63: '비', 65: '강한 비',
  71: '약한 눈', 73: '눈', 75: '강한 눈',
  77: '눈보라', 80: '소나기', 81: '소나기', 82: '폭우',
  85: '소나기눈', 86: '강한 소나기눈',
  95: '뇌우', 96: '우박 뇌우', 99: '강한 우박 뇌우',
};

function getWeatherDesc(code) {
  return WMO_DESCRIPTIONS[code] ?? '알 수 없음';
}

function getWeatherEmoji(code) {
  if (code === 0)       return '☀️';
  if (code <= 2)        return '🌤️';
  if (code === 3)       return '☁️';
  if (code <= 48)       return '🌫️';
  if (code <= 67)       return '🌧️';
  if (code <= 77)       return '❄️';
  if (code <= 82)       return '🌦️';
  return '⛈️';
}

// ===== 노을 품질 예측 알고리즘 =====
// 구름을 상층/중층/하층으로 분리하여 정밀 예측
// - 상층(권운, 8km+): 노을 때 불타는 붉은빛 반사의 주역
// - 중층(고적운, 3~8km): 오렌지·보라 색조 담당
// - 하층(층운, 3km-): 지평선 차단 주범

/**
 * PM2.5 기반 에어로졸 점수 (0~20)
 */
function scoreAerosol(pm25) {
  if (pm25 === null || pm25 === undefined) return 10;
  if (pm25 < 5)  return 8;   // 깨끗해도 레일리 산란으로 기본 노을 있음
  if (pm25 < 15) return 18;  // 최적
  if (pm25 < 35) return 16;  // 양호
  if (pm25 < 55) return 10;  // 보통 (약간 탁함)
  if (pm25 < 75) return 5;   // 나쁨
  return 2;                   // 매우 나쁨
}

/**
 * 상층 구름 점수 (0~22)
 * 권운·고권운: 노을 빛을 받아 붉게 불타는 구름의 주역
 */
function scoreCloudHigh(pct) {
  if (pct < 10)  return 11;  // 거의 없음: 레일리 산란만
  if (pct < 30)  return 17;  // 약간 있음
  if (pct < 70)  return 22;  // 최적: 화려한 노을
  if (pct < 90)  return 15;  // 많음: 여전히 괜찮음
  return 8;                   // 완전 덮임
}

/**
 * 중층 구름 점수 (0~13)
 * 고적운·고층운: 오렌지·자주 색조 담당
 */
function scoreCloudMid(pct) {
  if (pct < 10)  return 9;   // 거의 없음
  if (pct < 40)  return 13;  // 최적
  if (pct < 70)  return 8;   // 많아짐
  return 3;                   // 하늘 가림
}

/**
 * 하층 구름 점수 (0~5)
 * 층운·적운: 많으면 지평선 차단 → 노을 차단
 */
function scoreCloudLow(pct) {
  if (pct < 15)  return 5;   // 최적: 지평선 트임
  if (pct < 35)  return 3;   // 약간
  if (pct < 60)  return 1;   // 지평선 차단 위험
  return 0;                   // 차단
}

/**
 * 습도 점수 (0~18)
 */
function scoreHumidity(humidity) {
  if (humidity < 30) return 10;
  if (humidity < 55) return 18;
  if (humidity < 70) return 14;
  if (humidity < 85) return 7;
  return 3;
}

/**
 * 풍속 점수 (0~12)
 */
function scoreWind(windSpeed) {
  if (windSpeed < 1)  return 6;
  if (windSpeed < 5)  return 12;
  if (windSpeed < 10) return 9;
  if (windSpeed < 15) return 6;
  return 3;
}

/**
 * 계절 보정 점수 (0~10)
 */
function scoreSeason(month) {
  if (month === 9 || month === 10) return 10; // 가을: 최고
  if (month === 5 || month === 11) return 8;  // 초여름 끝·늦가을
  if (month === 3 || month === 4)  return 7;  // 봄 (황사 있지만 노을 아름다움)
  if (month === 12 || month === 1) return 7;  // 겨울 (건조)
  if (month === 2)                 return 6;  // 겨울 끝
  if (month === 6)                 return 5;  // 장마 전
  if (month === 7 || month === 8)  return 4;  // 여름 (장마)
  return 5;
}

/**
 * 종합 노을 품질 점수 계산 (0~100)
 * 최대 합계: 20 + 22 + 13 + 5 + 18 + 12 + 10 = 100
 */
function calculateSunsetScore(weather) {
  const { pm25, cloudHigh, cloudMid, cloudLow, humidity, windSpeed, month } = weather;

  const s_aerosol  = scoreAerosol(pm25);
  const s_high     = scoreCloudHigh(cloudHigh ?? 0);
  const s_mid      = scoreCloudMid(cloudMid ?? 0);
  const s_low      = scoreCloudLow(cloudLow ?? 0);
  const s_humidity = scoreHumidity(humidity);
  const s_wind     = scoreWind(windSpeed);
  const s_season   = scoreSeason(month);

  const total = s_aerosol + s_high + s_mid + s_low + s_humidity + s_wind + s_season;

  return {
    total: Math.min(100, Math.round(total)),
    breakdown: { s_aerosol, s_high, s_mid, s_low, s_humidity, s_wind, s_season },
  };
}

/**
 * 점수에 따른 등급 및 색상
 */
function getGrade(score) {
  const grades = t('grades');
  if (score >= 85) return { ...grades[0], color: "#FF4500", emoji: "🌅" };
  if (score >= 70) return { ...grades[1], color: "#FF7F00", emoji: "🧡" };
  if (score >= 55) return { ...grades[2], color: "#FFA500", emoji: "🌤️" };
  if (score >= 40) return { ...grades[3], color: "#FFD700", emoji: "🌥️" };
  return { ...grades[4], color: "#A9A9A9", emoji: "☁️" };
}

// ===== 일몰 시각 계산 =====
function calcSunsetTime(lat, lon, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const declination = 23.45 * Math.sin(B) * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;
  const hourAngle = Math.acos(cosHourAngle) * (180 / Math.PI);
  const solarNoon = 12 - (lon - 135) / 15 - EoT / 60;
  const sunset = solarNoon + hourAngle / 15;
  let h = Math.floor(sunset);
  let m = Math.round((sunset - h) * 60);
  if (m === 60) { h += 1; m = 0; }
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
  const { pm25, cloudHigh, cloudMid, cloudLow, humidity } = weather;
  const T = t('tips');

  if (score.total >= 70)                    tips.push(T.tripod);
  if (cloudHigh >= 20 && cloudHigh <= 70)   tips.push(T.clouds);
  if (pm25 >= 10 && pm25 <= 35)             tips.push(T.aerosol);
  if (pm25 > 55)                            tips.push(T.haze);
  if (humidity > 70)                        tips.push(T.humidity);
  if ((cloudLow ?? 0) > 50)                 tips.push(T.lowCloud);
  if (score.total >= 55) {
    tips.push(T.exposure);
    tips.push(T.wb);
  }
  if (tips.length === 0)                    tips.push(T.poor);
  return tips;
}

// ===== Open-Meteo API 호출 (무료, API 키 불필요) =====
async function fetchOpenMeteo(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relativehumidity_2m,windspeed_10m,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,weathercode` +
    `&hourly=cloudcover_low,cloudcover_mid,cloudcover_high,cloudcover,relativehumidity_2m,windspeed_10m,weathercode` +
    `&forecast_days=6&timezone=Asia%2FSeoul`;

  const aqUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=pm2_5,pm10,dust` +
    `&hourly=pm2_5` +
    `&forecast_days=6&timezone=Asia%2FSeoul`;

  let weatherRes, aqRes;
  try {
    [weatherRes, aqRes] = await Promise.all([fetch(weatherUrl), fetch(aqUrl)]);
  } catch (e) {
    throw new Error('네트워크 오류: 인터넷 연결을 확인해주세요.');
  }

  if (!weatherRes.ok) throw new Error(`날씨 데이터 오류 (${weatherRes.status})`);

  const weather = await weatherRes.json();
  const aq = aqRes.ok ? await aqRes.json() : null;

  return { weather, aq };
}

/**
 * Open-Meteo 시간별 예보에서 날짜별 일몰 시간대(17~19시) 데이터 추출
 */
function extractDailyForecast(weatherData, aqData) {
  const times = weatherData.hourly.time;

  // AQ 시간별 PM2.5 맵 구성
  const pm25Map = {};
  if (aqData?.hourly?.time) {
    aqData.hourly.time.forEach((t, i) => { pm25Map[t] = aqData.hourly.pm2_5[i]; });
  }

  const dailyMap = {};

  times.forEach((timeStr, i) => {
    const date = new Date(timeStr);
    const hour = date.getHours();
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });

    if (hour >= 15 && hour <= 20) {
      const prefer = hour === 18 || hour === 17;
      if (!dailyMap[dateStr] || prefer) {
        dailyMap[dateStr] = {
          dateStr,
          date,
          cloudHigh:   weatherData.hourly.cloudcover_high[i],
          cloudMid:    weatherData.hourly.cloudcover_mid[i],
          cloudLow:    weatherData.hourly.cloudcover_low[i],
          clouds:      weatherData.hourly.cloudcover[i],
          humidity:    weatherData.hourly.relativehumidity_2m[i],
          windSpeed:   weatherData.hourly.windspeed_10m[i],
          month:       date.getMonth() + 1,
          weatherCode: weatherData.hourly.weathercode[i],
          pm25:        pm25Map[timeStr] ?? null,
        };
      }
    }
  });

  return Object.values(dailyMap).slice(0, 5);
}

// ===== DOM 렌더링 =====
function renderCitySelector() {
  const sel = document.getElementById('city-select');
  sel.innerHTML = KOREAN_CITIES.map(c =>
    `<option value="${c.lat},${c.lon}" ${c.name === state.selectedCity.name ? 'selected' : ''}>${c.name}</option>`
  ).join('');
}

function renderCurrentConditions(weather, aq, lat, lon) {
  const cur = weather.current;

  const pm25      = aq?.current?.pm2_5 ?? null;
  const pm10      = aq?.current?.pm10  ?? null;
  const cloudHigh = cur.cloudcover_high;
  const cloudMid  = cur.cloudcover_mid;
  const cloudLow  = cur.cloudcover_low;
  const clouds    = cur.cloudcover;
  const humidity  = cur.relativehumidity_2m;
  const windSpeed = cur.windspeed_10m;
  const temp      = cur.temperature_2m;
  const code      = cur.weathercode;
  const month     = new Date().getMonth() + 1;

  const scoreResult = calculateSunsetScore({ pm25, cloudHigh, cloudMid, cloudLow, humidity, windSpeed, month });
  const grade = getGrade(scoreResult.total);
  const tips  = getPhotoTips({ pm25, cloudHigh, cloudMid, cloudLow, humidity }, scoreResult);
  const today = new Date();
  const sunsetTime = calcSunsetTime(lat, lon, today);
  const goldenHour = calcGoldenHour(lat, lon, today);

  // 점수 링 애니메이션
  const ring       = document.getElementById('score-ring');
  const scoreNum   = document.getElementById('score-number');
  const scoreLabel = document.getElementById('score-label');
  const gradeEl    = document.getElementById('score-grade');

  const circumference = 2 * Math.PI * 54;
  ring.style.strokeDasharray  = circumference;
  ring.style.strokeDashoffset = circumference - (scoreResult.total / 100) * circumference;
  ring.style.stroke            = grade.color;
  scoreNum.textContent         = scoreResult.total;
  scoreNum.style.color         = grade.color;
  scoreLabel.textContent       = grade.label;
  gradeEl.textContent          = `${grade.emoji} ${grade.grade}`;
  gradeEl.style.color          = grade.color;

  // 일몰 시각
  document.getElementById('sunset-time').textContent  = sunsetTime  || '--:--';
  document.getElementById('golden-hour').textContent  = goldenHour  || '--:-- ~ --:--';

  // 날씨 상세
  document.getElementById('stat-pm25').textContent        = pm25 !== null ? `${pm25.toFixed(1)} μg/m³` : t('noData');
  document.getElementById('stat-pm10').textContent        = pm10 !== null ? `${pm10.toFixed(1)} μg/m³` : t('noData');
  document.getElementById('stat-clouds').textContent      = `${clouds}%`;
  document.getElementById('stat-humidity').textContent    = `${humidity}%`;
  document.getElementById('stat-wind').textContent        = `${windSpeed.toFixed(1)} m/s`;
  document.getElementById('stat-temp').textContent        = `${temp.toFixed(1)}°C`;

  // 점수 세부 분석
  const bd = scoreResult.breakdown;
  renderBreakdownBar('bar-aerosol',    bd.s_aerosol,  20, grade.color);
  renderBreakdownBar('bar-cloud-high', bd.s_high,     22, grade.color);
  renderBreakdownBar('bar-cloud-mid',  bd.s_mid,      13, grade.color);
  renderBreakdownBar('bar-cloud-low',  bd.s_low,       5, grade.color);
  renderBreakdownBar('bar-humidity',   bd.s_humidity,  18, grade.color);
  renderBreakdownBar('bar-wind',       bd.s_wind,      12, grade.color);
  renderBreakdownBar('bar-season',     bd.s_season,    10, grade.color);

  // 구름 레이어 상세 (breakdown 섹션 서브텍스트)
  const cloudDetail = document.getElementById('cloud-detail');
  if (cloudDetail) {
    cloudDetail.textContent = `상층 ${cloudHigh}% · 중층 ${cloudMid}% · 하층 ${cloudLow}%`;
  }

  // 촬영 팁
  document.getElementById('photo-tips').innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');

  // 현재 날씨 설명
  document.getElementById('weather-desc').textContent =
    `${state.selectedCity.name} · ${getWeatherDesc(code)} · ${temp.toFixed(1)}°C`;

  document.getElementById('current-section').style.display = 'block';
}

function renderBreakdownBar(id, value, max, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width      = Math.round((value / max) * 100) + '%';
  el.style.background = color;
  const pctEl = document.getElementById(id.replace('bar-', 'pct-'));
  if (pctEl) pctEl.textContent = `${value}/${max}`;
}

function renderForecast(forecastItems, lat, lon) {
  const container = document.getElementById('forecast-cards');
  container.innerHTML = '';

  forecastItems.forEach((item, i) => {
    const scoreResult = calculateSunsetScore(item);
    const grade       = getGrade(scoreResult.total);
    const sunsetTime  = calcSunsetTime(lat, lon, item.date);
    const isToday     = i === 0;
    const emoji       = getWeatherEmoji(item.weatherCode);

    const card = document.createElement('div');
    card.className = `forecast-card ${isToday ? 'today' : ''}`;
    card.style.setProperty('--grade-color', grade.color);
    card.innerHTML = `
      <div class="forecast-date">${isToday ? t('today') : item.dateStr}</div>
      <div class="forecast-emoji">${grade.emoji}</div>
      <div class="forecast-score" style="color:${grade.color}">${scoreResult.total}<span>%</span></div>
      <div class="forecast-grade" style="color:${grade.color}">${grade.grade}</div>
      <div class="forecast-sunset">🌅 ${sunsetTime || '--:--'}</div>
      <div class="forecast-desc">${emoji} ${getWeatherDesc(item.weatherCode)}</div>
      <div class="forecast-bars">
        <div class="mini-bar-row">
          <span>상층</span>
          <div class="mini-bar"><div style="width:${item.cloudHigh}%;background:${grade.color}"></div></div>
          <span class="mini-pct">${item.cloudHigh}%</span>
        </div>
        <div class="mini-bar-row">
          <span>하층</span>
          <div class="mini-bar"><div style="width:${item.cloudLow}%;background:${grade.color}"></div></div>
          <span class="mini-pct">${item.cloudLow}%</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('forecast-section').style.display = 'block';
}

// ===== 상태 관리 =====
let state = {
  selectedCity: KOREAN_CITIES[0],
  currentData:  null,
  forecastData: [],
  loading:      false,
  error:        null,
};

async function loadData() {
  setLoading(true);
  clearError();

  try {
    const { lat, lon } = state.selectedCity;
    const { weather, aq } = await fetchOpenMeteo(lat, lon);

    const dailyForecast = extractDailyForecast(weather, aq);

    renderCurrentConditions(weather, aq, lat, lon);
    renderForecast(dailyForecast, lat, lon);

    state.currentData  = { weather, aq };
    state.forecastData = dailyForecast;
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function setLoading(val) {
  state.loading = val;
  document.getElementById('loading').style.display    = val ? 'flex' : 'none';
  document.getElementById('search-btn').disabled      = val;
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent    = msg;
  el.style.display  = 'block';
}

function clearError() {
  document.getElementById('error-msg').style.display = 'none';
}

// ===== 이벤트 바인딩 =====
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  renderCitySelector();

  document.getElementById('city-select').addEventListener('change', e => {
    const [lat, lon] = e.target.value.split(',').map(Number);
    state.selectedCity = KOREAN_CITIES.find(c => c.lat === lat && c.lon === lon);
  });

  document.getElementById('search-btn').addEventListener('click', loadData);

  loadData();
});
