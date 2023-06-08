import TelegramBot from "node-telegram-bot-api";
import OpenweatherService from "./openweather.service.js";
import TgBtns from "../telegram/tgBtns.js";
import TgMsgs from "../telegram/tgMessages.js";

export default class TelegramService {
  telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  bot = new TelegramBot(this.telegramBotToken, { polling: true });
  openweatherService = new OpenweatherService();
  db = {};

  setTgCommands() {
    this.bot.setMyCommands([
      {
        command: "/start",
        description: "Привітальне повідомлення",
      },
      {
        command: "/setcity",
        description: "Обрати місто",
      },
    ]);
  }

  onCommandsTgBot() {
    this.bot.onText(/\/start/, async (msg) => {
      const { id: chatId, first_name } = msg.chat;
      const firstMessage =
        `Вітаю, ${first_name}! 👋\n` +
        "Я допоможу тобі завжи знати, коли треба взяти парасольку ☂️ 😉\n\n" +
        TgMsgs.setCityMessage;
      await this.bot.sendMessage(chatId, firstMessage, TgBtns.startButton);
    });

    this.bot.onText(/\/setcity/, async (msg) => {
      const { id: chatId } = msg.chat;
      await this.bot.sendMessage(
        chatId,
        TgMsgs.setCityMessage,
        TgBtns.startButton
      );
    });
  }

  onMessageTgBot() {
    this.bot.on("message", async (msg) => {
      const { id: chatId } = msg.chat;
      const userCity = msg.text.trim().toLowerCase();

      if (userCity.indexOf("/") >= 0) {
        return;
      }

      try {
        const coordinates = await this.checkAndSetCityToDb(userCity, chatId);

        if (coordinates?.err) {
          return await this.sendErrorMessage(coordinates.err, chatId);
        }

        if (!coordinates) {
          return await this.bot.sendMessage(
            chatId,
            TgMsgs.notCity,
            TgBtns.startButton
          );
        }

        const { city } = coordinates;

        await this.bot.sendMessage(
          chatId,
          TgMsgs.findOutForecast(city),
          TgBtns.checkWeather(city)
        );
      } catch (error) {
        return this.sendErrorMessage(error.message, chatId);
      }
    });
  }

  onCallbackQueryTgBot() {
    this.bot.on("callback_query", async (msg) => {
      const {
        message: {
          chat: { id: chatId },
        },
        data,
      } = msg;

      try {
        if (data === "change" && this.db[chatId]) {
          return await this.bot.sendMessage(
            chatId,
            TgMsgs.setCityMessage,
            TgBtns.startButton
          );
        }

        if (data === "weather" && this.db[chatId]) {
          return await this.bot.sendMessage(
            chatId,
            TgMsgs.findOutForecast(this.db[chatId]?.city),
            TgBtns.intervals
          );
        }

        if ((data === "3" || data === "6") && this.db[chatId]) {
          const forecastFromOpenweather =
            await this.openweatherService.get5DaysWeatherEvery3HoursForecast(
              this.db[chatId]
            );
          const formatForecast =
            data === "6"
              ? this.openweatherService.formatForecastForHours(
                  forecastFromOpenweather,
                  6
                )
              : this.openweatherService.formatForecastForHours(
                  forecastFromOpenweather
                );

          const tgForecastMessage = this.openweatherService.getWeatherMessage(
            this.db[chatId]?.city,
            formatForecast
          );

          return await this.bot.sendMessage(
            chatId,
            tgForecastMessage,
            TgBtns.checkWeather(this.db[chatId].city)
          );
        }

        const coordinates = await this.checkAndSetCityToDb(data, chatId);
        if (coordinates?.err) {
          return await this.sendErrorMessage(coordinates.err, chatId);
        }

        const city = coordinates?.city || null;
        if (!city) {
          return;
        }

        return await this.bot.sendMessage(
          chatId,
          TgMsgs.findOutForecast(city),
          TgBtns.checkWeather(city)
        );
      } catch (error) {
        return this.sendErrorMessage(error.message, chatId);
      }
    });
  }

  async checkAndSetCityToDb(cityName, chatId) {
    try {
      if (!this.db[chatId]?.city || this.db[chatId]?.city !== cityName) {
        const coordinates =
          await this.openweatherService.getCoordinatesByCityName(cityName);

        this.db[chatId] = coordinates;
        return coordinates;
      }
    } catch (error) {
      return { err: error.message };
    }
  }

  async sendErrorMessage(errorMessage, chatId) {
    console.log(errorMessage);
    this.bot.sendMessage(
      chatId,
      "Щось пішло не за планом😕\n\nСпробуйте ще😉",
      TgBtns.startButton
    );
  }

  initTgBot() {
    this.setTgCommands();
    this.onMessageTgBot();
    this.onCommandsTgBot();
    this.onCallbackQueryTgBot();
  }
}
