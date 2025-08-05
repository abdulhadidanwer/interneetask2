// API configuration
const API_KEY = 'f0f78f3d96e4c58abed33d26687f7900'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherContainer = document.getElementById('weather-container');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');

// Weather data elements
const locationEl = document.getElementById('location');
const dateEl = document.getElementById('date');
const tempEl = document.getElementById('temperature');
const conditionsEl = document.getElementById('conditions');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIcon = document.getElementById('weather-icon');

// Backgrounds
const weatherBackgrounds = {
    'clear': 'bg-gradient-to-br from-blue-400 to-yellow-300',
    'clouds': 'bg-gradient-to-br from-gray-300 to-gray-500',
    'rain': 'bg-gradient-to-br from-gray-500 to-blue-700',
    'snow': 'bg-gradient-to-br from-gray-100 to-blue-200',
    'thunderstorm': 'bg-gradient-to-br from-gray-700 to-indigo-900',
    'drizzle': 'bg-gradient-to-br from-gray-400 to-blue-600',
    'mist': 'bg-gradient-to-br from-gray-200 to-gray-400',
    'default': 'bg-gradient-to-br from-blue-500 to-indigo-700'
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    locationBtn.addEventListener('click', getLocationWeather);
});

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) return showError('Please enter a city name');
    try {
        showLoading();
        const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200) throw new Error(data.message || 'City not found');
        displayWeather(data);
        hideError();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function getLocationWeather() {
    if (!navigator.geolocation) return showError('Geolocation is not supported by your browser');
    showLoading();
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== 200) throw new Error(data.message || 'Location not found');
            displayWeather(data);
            hideError();
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }, () => {
        showError('Unable to retrieve your location');
        hideLoading();
    });
}

function displayWeather(data) {
    const { name, sys, main, weather, wind } = data;
    locationEl.textContent = `${name}, ${sys.country}`;
    tempEl.textContent = `${Math.round(main.temp)}°C`;
    conditionsEl.textContent = weather[0].description;
    humidityEl.textContent = `${main.humidity}%`;
    windEl.textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    updateWeatherIcon(weather[0].main, weather[0].icon);
    updateWeatherBackground(weather[0].main.toLowerCase());
    weatherContainer.classList.remove('hidden');
}

function updateWeatherIcon(condition, iconCode) {
    let iconClass = 'fas fa-';
    switch (condition.toLowerCase()) {
        case 'clear':
            iconClass += iconCode.includes('n') ? 'moon' : 'sun';
            break;
        case 'clouds':
            iconClass += 'cloud';
            break;
        case 'rain':
            iconClass += 'cloud-rain';
            break;
        case 'snow':
            iconClass += 'snowflake';
            break;
        case 'thunderstorm':
            iconClass += 'bolt';
            break;
        case 'drizzle':
            iconClass += 'cloud-rain';
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            iconClass += 'smog';
            break;
        default:
            iconClass += 'cloud-sun';
    }
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
}

function updateWeatherBackground(condition) {
    const backgroundClass = weatherBackgrounds[condition] || weatherBackgrounds['default'];
    document.body.className = `min-h-screen ${backgroundClass} text-white`;
}

function showLoading() {
    loading.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

