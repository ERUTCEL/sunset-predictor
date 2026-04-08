const https = require('https');

const BASE = 'api.openweathermap.org';
const API_KEY = process.env.OWM_API_KEY;

const ALLOWED_ENDPOINTS = ['weather', 'air_pollution', 'forecast'];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: '서버에 API 키가 설정되지 않았습니다.' }) };
  }

  const { endpoint, lat, lon } = event.queryStringParameters || {};

  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: '잘못된 endpoint입니다.' }) };
  }
  if (!lat || !lon) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'lat, lon 파라미터가 필요합니다.' }) };
  }

  const url = `https://${BASE}/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

  try {
    const { status, body } = await httpsGet(url);
    return { statusCode: status, headers, body };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ message: '외부 API 호출 실패' }) };
  }
};
