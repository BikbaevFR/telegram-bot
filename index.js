const config = require("config");
const TelegramBot = require("node-telegram-bot-api");
const { deleteChat, startGame, chats } = require("./game");
const { againOptions } = require("./options");
const { commands } = require("./commands");

const token = config.get("token");

const bot = new TelegramBot(token, { polling: true });

const start = () => {
  bot.setMyCommands(commands);

  bot.on("message", async (msg) => {
    const { text, chat, from } = msg;
    const { first_name, last_name } = from;

    const chatId = chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/869/281/86928106-6812-340c-9d51-70ef0f8a4771/2.webp"
      );
      return bot.sendMessage(chatId, "Игра началась!");
    }

    if (text === "/info") {
      return bot.sendMessage(chatId, `Тебя зовут ${first_name} ${last_name}`);
    }

    if (text === "/game") {
      return startGame(chatId, bot);
    }

    bot.sendMessage(chatId, "Я тебя не понимаю");
  });

  bot.on("callback_query", async (msg) => {
    const { data, message } = msg;
    const chatId = message.chat.id;

    const randomNumber = chats[chatId];
    console.log(`chats`, chats);

    const isGuessed = +randomNumber === +data;

    if (data === "/again") {
      return startGame(chatId, bot);
    }

    if (isGuessed) {
      deleteChat();
      await bot.sendMessage(
        chatId,
        "https://cdn.tlgrm.ru/stickers/b8e/030/b8e030b6-a4b6-3cac-b5a9-1d30c04d83d8/192/4.webp"
      );
      await bot.sendMessage(chatId, "Поздравляю, ты выграл", againOptions);
    } else {
      deleteChat();
      await bot.sendMessage(
        chatId,
        `Не правильно, бот загадал число ${randomNumber}`,
        againOptions
      );
    }
  });
};

start();
