const apiKey = '10577a9d6d20d50e737bb45bdf0d462f';

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const errorDiv = document.getElementById('error');

const locationEl = document.getElementById('location');
const dateTimeEl = document.getElementById('dateTime');
const tempEl = document.getElementById('temp');
const conditionEl = document.getElementById('condition');
const hourlyEl = document.getElementById('hourly');
const dailyEl = document.getElementById('daily');
const weatherInfoEl = document.querySelector('.weather-info');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

async function fetchWeather(city) {
  errorDiv.textContent = '';
  weatherInfoEl.style.display = 'none';
  hourlyEl.innerHTML = '';
  dailyEl.innerHTML = '';

  try {
    // Get current weather and coordinates
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    if (!currentRes.ok) throw new Error('City not found');

    const currentData = await currentRes.json();

    // Extract lat & lon
    const { lat, lon } = currentData.coord;

    // Display current weather info
    displayCurrentWeather(currentData);

    // Fetch One Call API for hourly and daily forecast
    const oneCallRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}&units=metric`
    );
    if (!oneCallRes.ok) throw new Error('Forecast not found');
    const oneCallData = await oneCallRes.json();

    displayHourly(oneCallData.hourly);
    displayDaily(oneCallData.daily);

    weatherInfoEl.style.display = 'block';
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}

function displayCurrentWeather(data) {
  locationEl.textContent = `${data.name}, ${data.sys.country}`;
  dateTimeEl.textContent = formatDate(new Date());
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  conditionEl.textContent = capitalizeFirstLetter(data.weather[0].description);
}

function displayHourly(hourly) {
  // Show next 12 hours
  const next12Hours = hourly.slice(0, 12);
  next12Hours.forEach(hour => {
    const date = new Date(hour.dt * 1000);
    const hourStr = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    const hourDiv = document.createElement('div');
    hourDiv.classList.add('hour');
    hourDiv.innerHTML = `
      <div class="hour-time">${hourStr} ${ampm}</div>
      <div class="hour-temp">${Math.round(hour.temp)}°C</div>
    `;
    hourlyEl.appendChild(hourDiv);
  });
}

function displayDaily(daily) {
  // Show next 7 days
  const next7Days = daily.slice(1, 8); // skip current day
  next7Days.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-temp">Max: ${Math.round(day.temp.max)}°C</div>
      <div class="day-temp">Min: ${Math.round(day.temp.min)}°C</div>
    `;
    dailyEl.appendChild(dayDiv);
  });
}

function formatDate(date) {
  return date.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
