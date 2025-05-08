const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

// GitHub OAuth callback route
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('缺少 code 参数');
    }

    try {
        // 第一步：使用 code 请求 access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: code
            },
            {
                headers: { accept: 'application/json' }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.status(400).send('获取 access_token 失败');
        }

        // 第二步：使用 token 获取用户信息
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userData = userResponse.data;

        // 显示用户名和头像
        res.send(`
            <h1>欢迎, ${userData.login}</h1>
            <img src="${userData.avatar_url}" width="100" />
            <p><a href="/">返回主页</a></p>
        `);

    } catch (error) {
        console.error('OAuth 错误:', error);
        res.status(500).send('OAuth 登录出错');
    }
});

app.listen(PORT, () => {
    console.log(`服务运行在 http://localhost:${PORT}`);
});
