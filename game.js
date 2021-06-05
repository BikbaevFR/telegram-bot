const { gameOptions } = require("./options");

const chats = {};

const startGame = async (chatId, bot) => {
  await bot.sendMessage(chatId, "Тебе нужно отгадать число от 0 до 9");
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

module.exports = { startGame, chats };
