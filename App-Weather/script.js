const API_KEY = '4946f74105e60bbb1e6bad9bab8a00a1';

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultArea = document.getElementById('result-area');
const errorBox = document.getElementById('error');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return showError('Please enter a city name.');

  submitBtn.disabled = true;
  resultArea.innerHTML = '';
  hideError();

  try {
    const data = await fetchWeather(city);
    renderWeather(data);
  } catch (err) {
    showError(err.message || 'Failed to fetch weather.');
  } finally {
    submitBtn.disabled = false;
  }
});

async function fetchWeather(city){
  if (API_KEY === 'YOUR_API_KEY_HERE') throw new Error('Please replace YOUR_API_KEY_HERE with your OpenWeatherMap API key.');
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const resp = await fetch(endpoint);
  if (!resp.ok){
    if (resp.status === 404) throw new Error('City not found. Check the spelling and try again.');
    throw new Error('Weather API error: ' + resp.statusText);
  }
  return resp.json();
}

function renderWeather(data){
  const {main, weather, wind, name, sys} = data;
  const w = weather && weather[0] || {};
  const iconUrl = w.icon ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : '';

  const html = `
    <div class="card" role="article" aria-label="weather result">
      <div class="icon">${iconUrl ? `<img src="${iconUrl}" alt="${w.description || 'weather icon'}" width="96" height="96">` : ''}</div>
      <div class="weather-left">
        <div><strong>${escapeHtml(name)}${sys && sys.country ? ', ' + escapeHtml(sys.country) : ''}</strong></div>
        <div class="temp">${Math.round(main.temp)}°C</div>
        <div class="desc">${escapeHtml(w.description || '')}</div>
        <div class="meta">
          <div>Humidity: ${main.humidity}%</div>
          <div>Wind: ${wind && wind.speed ? wind.speed + ' m/s' : '—'}</div>
        </div>
      </div>
    </div>
  `;

  resultArea.innerHTML = html;
}

function showError(msg){
  errorBox.style.display = 'block';
  errorBox.textContent = msg;
}
function hideError(){
  errorBox.style.display = 'none';
  errorBox.textContent = '';
}

function escapeHtml(unsafe){
  if (!unsafe) return '';
  return String(unsafe).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}