# dream_bot
App that uses a specially trained GPT-3 model to generate dreams based on my own dreams, then tweets them.

Update 1/11/2023 - Originally, this was running on Heroku once a day using the free scheduler feature. However, Heroku recently got rid of their free one-off dynos that the scheduler uses. In the interest of not spending $5/month to tweet fake dreams into the abyss, I decided to try a different method of running my bot.

The solution I have arrived at uses Github Actions to `npm start` the `dream_bot.js` file. Still working out the kinks, but for now, this seems to be a good solution and Dorothy Dream Bot is back in business.
