require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 临时数据库
let articles = [];
let users = [];

// GitHub OAuth配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// 认证路由
app.get('/auth/github', async (req, res) => {
    const { code } = req.query;
    
    // 获取Access Token
    const { data } = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
    }, { headers: { Accept: 'application/json' } });

    // 获取用户信息
    const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${data.access_token}` }
    });

    // 用户数据
    const userData = {
        id: userRes.data.id,
        username: userRes.data.login,
        avatar: userRes.data.avatar_url,
        token: data.access_token
    };

    // 保存用户
    if (!users.find(u => u.id === userData.id)) {
        users.push(userData);
    }

    res.redirect(`/?token=${data.access_token}`);
});

// 文章API
app.get('/api/articles', (req, res) => {
    res.json(articles);
});

app.post('/api/articles', (req, res) => {
    const newArticle = {
        ...req.body,
        id: Date.now().toString(),
        createdAt: new Date()
    };
    articles.push(newArticle);
    res.status(201).json(newArticle);
});

app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'));
