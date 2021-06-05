const config = require("config");
const TelegramBot = require("node-telegram-bot-api");
const { startGame, chats } = require("./game");
const { againOptions } = require("./options");
const { commands } = require("./commands");
const sequelize = require("./db");
const UserModel = require("./models");

const token = config.get("token");

const bot = new TelegramBot(token, { polling: true });

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  bot.setMyCommands(commands);

  bot.on("message", async (msg) => {
    try {
      const { text, chat, from } = msg;
      const { first_name, last_name } = from;

      const chatId = chat.id;

      if (text === "/start") {
        await UserModel.create({ chatId });

        await bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/869/281/86928106-6812-340c-9d51-70ef0f8a4771/2.webp"
        );
        return bot.sendMessage(chatId, "Игра началась!");
      }

      if (text === "/info") {
        const user = await UserModel.findOne({ chatId });
        const { right, wrong } = user;

        return bot.sendMessage(
          chatId,
          `Тебя зовут ${first_name} ${last_name}. У тебя правильных ответов - ${right}, неправильных - ${wrong}`
        );
      }

      if (text === "/game") {
        return startGame(chatId, bot);
      }

      bot.sendMessage(chatId, "Я тебя не понимаю");
    } catch (error) {
      bot.sendMessage(chatId, "Произошла ошибка");
    }
  });

  bot.on("callback_query", async (msg) => {
    const { data, message } = msg;
    const chatId = message.chat.id;
    const user = await UserModel.findOne({ chatId });

    const randomNumber = chats[chatId];
    const isGuessed = +randomNumber === +data;

    if (data === "/again") {
      return startGame(chatId, bot);
    }

    if (isGuessed) {
      user.right += 1;
      await bot.sendMessage(chatId, "Поздравляю, ты выграл", againOptions);
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `Не правильно, бот загадал число ${randomNumber}`,
        againOptions
      );
    }

    await user.save();
  });
};

start();
