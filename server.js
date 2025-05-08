const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(cookieParser());

// 登录重定向到 GitHub OAuth 授权页
app.get('/login', (req, res) => {
    const redirect_uri = `http://localhost:${PORT}/callback`;
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    res.redirect(githubUrl);
});

// GitHub OAuth 回调
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('缺少 code');

    try {
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code
            },
            { headers: { accept: 'application/json' } }
        );

        const access_token = tokenRes.data.access_token;
        if (!access_token) return res.status(400).send('access_token 获取失败');

        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const user = userRes.data;
        res.cookie('username', user.login, { maxAge: 86400000 });
        res.cookie('avatar', user.avatar_url, { maxAge: 86400000 });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('登录失败');
    }
});

// 登出接口
app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('avatar');
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
