require('dotenv').config();

const oauthSignature = require('oauth-signature');
const { Configuration, OpenAIApi } = require('openai');
// const http = require('http');
const https = require('follow-redirects').https;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const truncateDream = (dream) => {
  if (dream.length > 280) {
    dream = dream.slice(0, 280);
  }
  const dreamArr = dream.split('');
  if (
    dreamArr[dream.length - 1] !== '.' &&
    dreamArr[dream.length - 1] !== '"'
  ) {
    for (let i = dreamArr.length - 2; i > 0; i--) {
      if (dreamArr[i] === '.') {
        return dream.slice(0, i + 1);
      }
    }
  } else {
    return dream;
  }
};

const tweetDream = async function (dream) {
  const random_source =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += random_source.charAt(
      Math.floor(Math.random() * random_source.length)
    );
  }
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    oauth_consumer_key: process.env.CONSUMER_KEY,
    oauth_token: process.env.ACCESS_TOKEN,
    oauth_nonce: nonce,
    oauth_timestamp: timestamp,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
  };
  const signature = oauthSignature.generate(
    'POST',
    'https://api.twitter.com/2/tweets',
    params,
    process.env.CONSUMER_SECRET,
    process.env.TOKEN_SECRET
  );

  const options = {
    method: 'POST',
    hostname: 'api.twitter.com',
    path: '/2/tweets',
    headers: {
      Authorization: `OAuth oauth_consumer_key="${process.env.CONSUMER_KEY}",oauth_token="${process.env.ACCESS_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${signature}"`,
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      const body = chunk;
      console.log(body.toString());
    });

    res.on('error', (error) => {
      console.error(error);
    });
  });

  const postData = JSON.stringify({
    text: dream,
  });

  req.write(postData);

  req.end();
};
async function getDream() {
  const response = await openai.createCompletionFromModel({
    model: 'curie:ft-personal-2022-04-16-17-13-47',
    prompt: 'Last night, I dreamed',
    temperature: 0.75,
    max_tokens: 80,
    top_p: 1,
    frequency_penalty: 1.06,
    presence_penalty: 1.1,
  });
  const truncatedDream = truncateDream(
    `Last night, I dreamed${response.data.choices[0].text}`
  );

  tweetDream(truncatedDream);
}

getDream();
