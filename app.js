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

function getWeatherDesc(code) { return WMO_DESCRIPTIONS[code] ?? '알 수 없음'; }

function getWeatherEmoji(code) {
  if (code === 0)  return '☀️';
  if (code <= 2)   return '🌤️';
  if (code === 3)  return '☁️';
  if (code <= 48)  return '🌫️';
  if (code <= 67)  return '🌧️';
  if (code <= 77)  return '❄️';
  if (code <= 82)  return '🌦️';
  return '⛈️';
}

// =============================================================
// ===== 노을 품질 예측 알고리즘 (논문 기반 개선판) =====
// 점수 구성 (합계 100):
//   에어로졸(AOD+PM2.5) 20 | 상층구름 20 | 중층구름 12
//   하층구름 5 | 가시거리 8 | 습도(이슬점) 16 | 풍속 12 | 계절 7
// 기압·CAPE는 구름 점수에 ×보정계수로 적용
// =============================================================

// ── 이슬점 계산 (Magnus 공식) ──────────────────────────────
function calcDewpoint(rh, temp) {
  const a = 17.625, b = 243.04;
  const ln = Math.log(rh / 100);
  return (b * (ln + (a * temp) / (b + temp))) /
         (a  - (ln + (a * temp) / (b + temp)));
}

// ── AOD (에어로졸 광학 깊이) 점수 (0~20) ──────────────────
// AOD는 대기 전체 컬럼의 빛 소산량. PM2.5보다 노을 색상과
// 직접 연관 (Rayleigh + Mie 산란 논문 근거)
function scoreAOD(aod) {
  if (aod === null || aod === undefined) return null;
  if (aod < 0.05)  return 10;  // 너무 깨끗 → 색 밋밋
  if (aod < 0.15)  return 16;  // 양호
  if (aod < 0.40)  return 20;  // 최적: 풍부한 붉은색
  if (aod < 0.70)  return 16;  // 탁하지만 색채 있음
  if (aod < 1.0)   return 10;  // 매우 탁함
  return 5;                     // 극심한 탁도
}

// ── PM2.5 점수 (0~20, AOD 없을 때 단독 사용) ─────────────
function scorePM25(pm25) {
  if (pm25 === null || pm25 === undefined) return 10;
  if (pm25 < 5)   return 10;
  if (pm25 < 15)  return 18;
  if (pm25 < 35)  return 16;
  if (pm25 < 55)  return 10;
  if (pm25 < 75)  return 5;
  return 2;
}

// ── 에어로졸 통합 점수 (AOD 60% + PM2.5 40% 블렌드) ──────
function scoreAerosol(aod, pm25) {
  const aodScore = scoreAOD(aod);
  const pm25Score = scorePM25(pm25);
  if (aodScore === null) return pm25Score;
  return Math.round(0.6 * aodScore + 0.4 * pm25Score);
}

// ── 상층 구름 점수 (0~20) ─────────────────────────────────
// 권운·고권운(8km+): 노을 빛에 불타는 붉은빛의 핵심
function scoreCloudHigh(pct) {
  if (pct < 10)   return 10;
  if (pct < 30)   return 15;
  if (pct < 70)   return 20;  // 최적
  if (pct < 90)   return 14;
  return 8;
}

// ── 중층 구름 점수 (0~12) ─────────────────────────────────
// 고적운·고층운(3~8km): 오렌지·자주 색조 담당
function scoreCloudMid(pct) {
  if (pct < 10)   return 8;
  if (pct < 40)   return 12;  // 최적
  if (pct < 70)   return 7;
  return 2;
}

// ── 하층 구름 점수 (0~5) ──────────────────────────────────
// 층운·적운(3km-): 지평선 차단 → 감점
function scoreCloudLow(pct) {
  if (pct < 15)   return 5;
  if (pct < 35)   return 3;
  if (pct < 60)   return 1;
  return 0;
}

// ── 기압 기반 대기 안정도 보정계수 ────────────────────────
// 고기압 → 안정 → 구름 지속 / 저기압 → 불안정 → 구름 빠르게 변화
function getPressureModifier(pressure) {
  if (!pressure) return 1.0;
  if (pressure > 1020)  return 1.10;
  if (pressure > 1015)  return 1.05;
  if (pressure > 1010)  return 1.00;
  if (pressure > 1005)  return 0.95;
  return 0.90;
}

// ── CAPE 기반 대류 보정계수 ───────────────────────────────
// 적당한 CAPE → 중층 구름 발생 예상 (노을 도움)
// 과도한 CAPE → 뇌우 가능성 (어두운 적란운)
function getCAPEModifier(cape) {
  if (!cape || cape < 100)   return 1.00;
  if (cape < 500)             return 1.05;
  if (cape < 1500)            return 1.12;  // 최적 구름 발달
  if (cape < 3000)            return 1.00;
  return 0.82;                               // 폭풍 위험
}

// ── 가시거리 점수 (0~8) ───────────────────────────────────
// 대기 탁도의 지상 실측치. AOD와 함께 이중 검증 역할
// 5,000~15,000m: 약간 뿌연 대기 → 산란광 풍부
function scoreVisibility(visMeters) {
  if (!visMeters) return 4;
  if (visMeters > 30000)  return 4;   // 너무 맑음 → 색 밋밋
  if (visMeters > 15000)  return 6;   // 양호
  if (visMeters > 5000)   return 8;   // 최적: 적당한 에어로졸
  if (visMeters > 2000)   return 5;   // 매우 탁함
  return 1;                            // 안개/극심한 탁도
}

// ── 습도 점수 (0~16, 이슬점 기반) ────────────────────────
// 단순 RH 대신 이슬점(절대 수분량)으로 컬럼 수분 근사
// 이슬점 5~15°C: 적당한 수분 → 에어로졸 흡습 성장 → 색 향상
function scoreHumidity(rh, temp) {
  const dp = calcDewpoint(rh, temp);
  if (dp < -5)   return 10;  // 매우 건조
  if (dp < 5)    return 13;  // 건조
  if (dp < 15)   return 16;  // 최적
  if (dp < 20)   return 10;  // 습함
  return 5;                   // 매우 습함 (안개 위험)
}

// ── 풍속 점수 (0~12) ──────────────────────────────────────
function scoreWind(windSpeed) {
  if (windSpeed < 1)   return 6;
  if (windSpeed < 5)   return 12;  // 최적
  if (windSpeed < 10)  return 9;
  if (windSpeed < 15)  return 6;
  return 3;
}

// ── 계절 보정 점수 (0~7) ──────────────────────────────────
function scoreSeason(month) {
  if (month === 9 || month === 10)  return 7;   // 가을: 최고
  if (month === 5 || month === 11)  return 6;
  if (month === 3 || month === 4)   return 5;
  if (month === 12 || month === 1)  return 5;
  if (month === 2)                  return 4;
  if (month === 6)                  return 3;
  if (month === 7 || month === 8)   return 2;   // 여름 장마: 최저
  return 3;
}

// ── 종합 노을 품질 점수 (0~100) ───────────────────────────
// 기압·CAPE 보정 포함 시 최대 ~103 → Math.min(100, ...) 처리
function calculateSunsetScore(weather) {
  const { aod, pm25, cloudHigh, cloudMid, cloudLow,
          visibility, humidity, temp, windSpeed, month,
          pressure, cape } = weather;

  const s_aerosol    = scoreAerosol(aod, pm25);
  const s_high       = Math.round(scoreCloudHigh(cloudHigh ?? 0) * getPressureModifier(pressure));
  const s_mid        = Math.round(scoreCloudMid(cloudMid   ?? 0) * getCAPEModifier(cape));
  const s_low        = scoreCloudLow(cloudLow ?? 0);
  const s_visibility = scoreVisibility(visibility);
  const s_humidity   = scoreHumidity(humidity ?? 60, temp ?? 15);
  const s_wind       = scoreWind(windSpeed ?? 3);
  const s_season     = scoreSeason(month);

  const total = s_aerosol + s_high + s_mid + s_low +
                s_visibility + s_humidity + s_wind + s_season;

  return {
    total: Math.min(100, Math.round(total)),
    breakdown: { s_aerosol, s_high, s_mid, s_low, s_visibility, s_humidity, s_wind, s_season },
    meta: {
      aodUsed:  aod !== null && aod !== undefined,
      pressure: pressure?.toFixed(0),
      cape:     cape?.toFixed(0),
      dewpoint: (humidity && temp) ? calcDewpoint(humidity, temp).toFixed(1) : null,
    },
  };
}

// ── 점수 등급 ─────────────────────────────────────────────
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

// ===== 촬영 팁 =====
function getPhotoTips(weather, score) {
  const tips = [];
  const { pm25, cloudHigh, cloudLow, humidity, temp } = weather;
  const T = t('tips');

  if (score.total >= 70)                     tips.push(T.tripod);
  if ((cloudHigh ?? 0) >= 20 && (cloudHigh ?? 0) <= 70) tips.push(T.clouds);
  if (pm25 >= 10 && pm25 <= 35)              tips.push(T.aerosol);
  if (pm25 > 55)                             tips.push(T.haze);
  if (humidity && temp && calcDewpoint(humidity, temp) > 18) tips.push(T.humidity);
  if ((cloudLow ?? 0) > 50)                 tips.push(T.lowCloud);
  if (score.total >= 55) {
    tips.push(T.exposure);
    tips.push(T.wb);
  }
  if (tips.length === 0) tips.push(T.poor);
  return tips;
}

// ===== Open-Meteo API (무료, 키 불필요) =====
async function fetchOpenMeteo(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relativehumidity_2m,windspeed_10m,` +
    `cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,` +
    `weathercode,pressure_msl,visibility` +
    `&hourly=cloudcover_low,cloudcover_mid,cloudcover_high,cloudcover,` +
    `relativehumidity_2m,windspeed_10m,weathercode,` +
    `temperature_2m,pressure_msl,visibility,cape` +
    `&forecast_days=6&timezone=Asia%2FSeoul`;

  const aqUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=pm2_5,pm10,dust,aerosol_optical_depth` +
    `&hourly=pm2_5,aerosol_optical_depth` +
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

// ===== 시간별 예보에서 일몰 시간대(15~20시) 데이터 추출 =====
function extractDailyForecast(weatherData, aqData) {
  const times = weatherData.hourly.time;

  // AQ 시간별 맵 구성
  const aqMap = {};
  if (aqData?.hourly?.time) {
    aqData.hourly.time.forEach((t, i) => {
      aqMap[t] = {
        pm25: aqData.hourly.pm2_5?.[i] ?? null,
        aod:  aqData.hourly.aerosol_optical_depth?.[i] ?? null,
      };
    });
  }

  const dailyMap = {};

  times.forEach((timeStr, i) => {
    const date = new Date(timeStr);
    const hour = date.getHours();
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });

    if (hour >= 15 && hour <= 20) {
      const prefer = hour === 18 || hour === 17;
      if (!dailyMap[dateStr] || prefer) {
        const aq = aqMap[timeStr] ?? {};
        dailyMap[dateStr] = {
          dateStr,
          date,
          cloudHigh:   weatherData.hourly.cloudcover_high[i],
          cloudMid:    weatherData.hourly.cloudcover_mid[i],
          cloudLow:    weatherData.hourly.cloudcover_low[i],
          clouds:      weatherData.hourly.cloudcover[i],
          humidity:    weatherData.hourly.relativehumidity_2m[i],
          temp:        weatherData.hourly.temperature_2m[i],
          windSpeed:   weatherData.hourly.windspeed_10m[i],
          pressure:    weatherData.hourly.pressure_msl?.[i] ?? null,
          cape:        weatherData.hourly.cape?.[i] ?? null,
          visibility:  weatherData.hourly.visibility?.[i] ?? null,
          month:       date.getMonth() + 1,
          weatherCode: weatherData.hourly.weathercode[i],
          pm25:        aq.pm25 ?? null,
          aod:         aq.aod  ?? null,
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

  const pm25       = aq?.current?.pm2_5                  ?? null;
  const pm10       = aq?.current?.pm10                   ?? null;
  const aod        = aq?.current?.aerosol_optical_depth  ?? null;
  const cloudHigh  = cur.cloudcover_high;
  const cloudMid   = cur.cloudcover_mid;
  const cloudLow   = cur.cloudcover_low;
  const clouds     = cur.cloudcover;
  const humidity   = cur.relativehumidity_2m;
  const temp       = cur.temperature_2m;
  const windSpeed  = cur.windspeed_10m;
  const pressure   = cur.pressure_msl   ?? null;
  const visibility = cur.visibility     ?? null;
  const code       = cur.weathercode;
  const month      = new Date().getMonth() + 1;

  // CAPE는 current에 없으므로 hourly 첫 번째 값 참고
  const cape = weather.hourly?.cape?.[0] ?? null;

  const scoreResult = calculateSunsetScore({
    aod, pm25, cloudHigh, cloudMid, cloudLow,
    visibility, humidity, temp, windSpeed, month, pressure, cape,
  });
  const grade = getGrade(scoreResult.total);
  const tips  = getPhotoTips({ pm25, cloudHigh, cloudLow, humidity, temp }, scoreResult);
  const today = new Date();
  const sunsetTime = calcSunsetTime(lat, lon, today);
  const goldenHour = calcGoldenHour(lat, lon, today);

  // 점수 링
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

  document.getElementById('sunset-time').textContent = sunsetTime || '--:--';
  document.getElementById('golden-hour').textContent = goldenHour || '--:-- ~ --:--';

  // 통계
  document.getElementById('stat-pm25').textContent     = pm25 !== null ? `${pm25.toFixed(1)} μg/m³` : t('noData');
  document.getElementById('stat-pm10').textContent     = pm10 !== null ? `${pm10.toFixed(1)} μg/m³` : t('noData');
  document.getElementById('stat-clouds').textContent   = `${clouds}%`;
  document.getElementById('stat-humidity').textContent = `${humidity}%`;
  document.getElementById('stat-wind').textContent     = `${windSpeed.toFixed(1)} m/s`;
  document.getElementById('stat-temp').textContent     = `${temp.toFixed(1)}°C`;

  // 메타 정보 (이슬점·AOD·기압 표시)
  const metaEl = document.getElementById('score-meta');
  if (metaEl) {
    const parts = [];
    const m = scoreResult.meta;
    if (m.dewpoint !== null)  parts.push(`이슬점 ${m.dewpoint}°C`);
    if (m.aodUsed)            parts.push(`AOD ${aod.toFixed(2)}`);
    if (m.pressure !== null)  parts.push(`기압 ${m.pressure} hPa`);
    if (m.cape !== null)      parts.push(`CAPE ${Number(m.cape).toFixed(0)} J/kg`);
    metaEl.textContent = parts.join('  ·  ');
  }

  // 항목별 분석 바
  const bd = scoreResult.breakdown;
  renderBreakdownBar('bar-aerosol',    bd.s_aerosol,    20, grade.color);
  renderBreakdownBar('bar-cloud-high', bd.s_high,       20, grade.color);
  renderBreakdownBar('bar-cloud-mid',  bd.s_mid,        12, grade.color);
  renderBreakdownBar('bar-cloud-low',  bd.s_low,         5, grade.color);
  renderBreakdownBar('bar-visibility', bd.s_visibility,  8, grade.color);
  renderBreakdownBar('bar-humidity',   bd.s_humidity,   16, grade.color);
  renderBreakdownBar('bar-wind',       bd.s_wind,       12, grade.color);
  renderBreakdownBar('bar-season',     bd.s_season,      7, grade.color);

  // 촬영 팁
  document.getElementById('photo-tips').innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');

  // 날씨 설명
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
  document.getElementById('loading').style.display = val ? 'flex' : 'none';
  document.getElementById('search-btn').disabled   = val;
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent   = msg;
  el.style.display = 'block';
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
