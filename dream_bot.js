require('dotenv').config();

const oauthSignature = require('oauth-signature');
const { Configuration, OpenAIApi } = require('openai');
const https = require('follow-redirects').https;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const truncateDream = (dream) => {
  const dreamArr = dream.split('');
  if (dreamArr[dream.length - 1] !== '.') {
    for (let i = dreamArr.length - 2; i > 0; i--) {
      if (dreamArr[i] === '.') {
        return dream.slice(0, i + 1);
      }
    }
  } else {
    return dream;
  }
};

const tweetDream = async function (dream, timestamp, nonce) {
  // const params = {
  //   oauth_consumer_key: process.env.CONSUMER_KEY,
  //   oauth_token: process.env.ACCESS_TOKEN,
  //   oauth_nonce: process.env.OAUTH_NONCE,
  //   oauth_timestamp: process.env.OAUTH_TIMESTAMP,
  //   oauth_signature_method: 'HMAC-SHA1',
  //   oauth_version: '1.0'
  // };
  // const signature = oauthSignature.generate(
  //   'POST',
  //   '/2/tweets',
  //   params
  //   process.env.CONSUMER_SECRET,
  //   process.env.TOKEN_SECRET,
  //
  // );

  var options = {
    method: 'POST',
    hostname: 'api.twitter.com',
    path: '/2/tweets',
    headers: {
      Authorization: `OAuth oauth_consumer_key="${process.env.CONSUMER_KEY}",oauth_token="${process.env.ACCESS_TOKEN}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${process.env.OAUTH_TIMESTAMP}",oauth_nonce="${process.env.OAUTH_NONCE}",oauth_version="1.0",oauth_signature="${process.env.OAUTH_SIGNATURE}"`,
      'Content-Type': 'application/json',
    },
  };

  var req = https.request(options, function (res) {
    var chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });

    res.on('error', function (error) {
      console.error(error);
    });
  });

  var postData = JSON.stringify({
    text: dream,
  });

  req.write(postData);

  req.end();
};
async function getDream() {
  const response = await openai.createCompletionFromModel({
    model: 'davinci:ft-personal-2022-04-09-19-12-54',
    prompt: 'Last night, I dreamed',
    temperature: 0.4,
    max_tokens: 50,
    top_p: 1,
    frequency_penalty: 1.06,
    presence_penalty: 1.1,
  });
  const truncatedDream = truncateDream(response.data.choices[0].text);
  const timestamp = Math.round(Date.now() / 1000);
  const nonce = Buffer.from(process.env.CONSUMER_KEY, timestamp).toString(
    'base64'
  );
  tweetDream(`Last night, I dreamed${truncatedDream}`, timestamp, nonce);
}

getDream();
