
const express = require('express');
const app = express();
const port = 3000;
const fileupload = require('express-fileupload')
const AWS = require('aws-sdk');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(express.json())
app.use(fileupload())
// Here our frontend origin only so that no other domain can access
app.use(cors({
    origin: 'http://localhost:3001',
}))

AWS.config.update({
    region: 'ap-south-1', accessKeyId: process.env.KEY,
    secretAccessKey: process.env.SECRET,
});
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const client = new OAuth2Client(process.env.CLIENT_ID);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN, (err, user) => {
        console.log('errat', err, user);
        if (err) return res.status(403).send({ error: 'not authorised' });
        req.user = user;
        next();
    });
}


function generateAccessToken(username, email) {
    return jwt.sign({ name: username, email: email }, process.env.TOKEN, {
        expiresIn: '7d',
    });
}

app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    const user = { name, email, picture };
    const jwtToken = generateAccessToken(user.name, user.email);
    res.status(201);
    res.json({ token: jwtToken, user: user });
});

app.post('/upload', authenticateToken, (req, res) => {
    const user = req.user;
    const file = req.files.file
    const params = {
        Body: file.data,
        Bucket: 'file-uploader-krayo',
        Key: `${user.email}/${file.name}`,
    };
    console.log('params',params)
    s3.putObject(params).send((err) => {
        console.log('data',err)
        if (err) {
            res.send('error')
        }
        else {
            res.send('success')
        }
    })
});

app.get('/getFiles', authenticateToken, (req, res) => {
    const user = req.user;
    const params = { Bucket: 'file-uploader-krayo', Prefix: user.email }
    s3.listObjects(params, function (err, data) {
        if (err) {
            res.send('error')
        }// an error occurred
        else {
            res.send(data)
        }         // successful response
    });
})


app.get('/downloadFile/:Key', authenticateToken,(req, res) => {
    
    const user = req.user;
    const Key = `${user.email}/${req.params.Key}`;
    const params = {
        Bucket: 'file-uploader-krayo',
        Key: Key
    }
    s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            res.send('error')
        } else {
            res.send(url)
        }
    })
})

app.listen(port, () => {
    console.log(`krayo app listening on port ${port}`);
});