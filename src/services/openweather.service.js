import axios from "axios";
import {
  convertUnixDate,
  getWeekdayDateStringFromDate,
  getTimeStringFromDate,
} from "../helpers/convertDate.js";

export default class OpenweatherService {
  url = "https://api.openweathermap.org";

  async getCoordinatesByCityName(cityName) {
    const urlGeocoding = new URL(`${this.url}/geo/1.0/direct`);
    urlGeocoding.searchParams.append("q", cityName);
    urlGeocoding.searchParams.append("appid", process.env.OPENWEATHER_API_KEY);

    const { data } = await axios.get(urlGeocoding);
    if (data.length <= 0) {
      return null;
    }

    const {
      local_names: { uk: city },
      lat,
      lon,
    } = data[0];

    return { city, lat, lon };
  }

  async get5DaysWeatherEvery3HoursForecast({ lat, lon }) {
    const urlWeather = new URL(`${this.url}/data/2.5/forecast`);
    urlWeather.searchParams.append("lat", lat);
    urlWeather.searchParams.append("lon", lon);
    urlWeather.searchParams.append("lang", "uk");
    urlWeather.searchParams.append("units", "metric");
    urlWeather.searchParams.append("appid", process.env.OPENWEATHER_API_KEY);
    const { data } = await axios.get(urlWeather);
    return data.list;
  }

  getIcon(icon) {
    switch (icon.slice(0, -1)) {
      case "01":
        return "☀️";
      case "02":
        return "🌤️";
      case "03":
        return "☁️";
      case "04":
        return "☁️";
      case "09":
        return "🌧️";
      case "10":
        return "🌦️";
      case "11":
        return "🌩️";
      case "13":
        return "❄️";
      case "50":
        return "🌫️";
    }
  }

  getTempString(temp) {
    const sign = +temp >= 0 ? "+" : "-";
    return `${sign}${Math.round(+temp)}°C`;
  }

  formatForecastForHours(forecast, hours) {
    if (+hours === 6) {
      forecast = forecast.filter((item, index) => index % 2 === 0);
    }

    return forecast.reduce((prev, curr) => {
      const date = convertUnixDate(curr.dt);
      const weekdayDateString = getWeekdayDateStringFromDate(date);
      if (!prev[weekdayDateString]) prev[weekdayDateString] = [];
      prev[weekdayDateString].push({
        time: getTimeStringFromDate(date),
        temp: this.getTempString(curr.main.temp),
        feels_temp: this.getTempString(curr.main.feels_like),
        weather: curr.weather[0].description,
        icon: this.getIcon(curr.weather[0].icon),
      });
      return prev;
    }, {});
  }

  getWeatherMessage(city, forecast) {
    let message = `Погода в м. ${city}\n`;

    for (let key in forecast) {
      message += "\n" + key + "\n";
      forecast[key].forEach((item) => {
        message +=
          item.time +
          ": " +
          item.temp +
          ", відчувається як: " +
          item.feels_temp +
          ", " +
          item.weather +
          item.icon +
          "\n";
      });
    }

    return message;
  }
}
