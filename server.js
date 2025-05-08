// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const client_id = '你的 GitHub Client ID';
const client_secret = '你的 GitHub Client Secret';

app.get('/github-oauth', async (req, res) => {
  const code = req.query.code;

  try {
    // 获取 access_token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id,
        client_secret,
        code
      },
      {
        headers: {
          accept: 'application/json'
        }
      }
    );

    const access_token = tokenRes.data.access_token;

    // 获取用户信息
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });

    const { login, avatar_url } = userRes.data;

    res.json({ login, avatar_url });
  } catch (err) {
    res.status(500).json({ error: '授权失败', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('OAuth 服务运行在 http://localhost:3000');
});
