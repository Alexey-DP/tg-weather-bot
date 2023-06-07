const months = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

const weekDays = [
  "Неділя",
  "Понеділок",
  "Вівторок",
  "Середа",
  "Четвер",
  "П’ятниця",
  "Субота",
];

export const convertUnixDate = (unixTimestamp) => {
  return new Date(unixTimestamp * 1000);
};

export const getWeekdayDateStringFromDate = (date) => {
  return `${weekDays[date.getUTCDay()]}, ${date.getUTCDate()} ${
    months[date.getUTCMonth()]
  } ${date.getUTCFullYear()}:`;
};

export const getTimeStringFromDate = (date) => {
  const hours = date.getUTCHours();
  return hours < 10 ? `0${hours}:00` : `${hours}:00`;
};
