export default {
  startButton: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Київ 🏙️",
            callback_data: "kyiv",
          },
          {
            text: "Дніпро 🌇",
            callback_data: "dnipro",
          },
          {
            text: "Львів ⛰️",
            callback_data: "lviv",
          },
        ],
      ],
    },
  },
  checkWeather: (city) => ({
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Змінити місто ♻️",
            callback_data: "change",
          },
          {
            text: `Прогноз у м. ${city} 🌞`,
            callback_data: "weather",
          },
        ],
      ],
    },
  }),
  intervals: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "З інтервалом в 3 години",
            callback_data: "3",
          },
          {
            text: "З інтервалом в 6 години",
            callback_data: "6",
          },
        ],
      ],
    },
  },
};
