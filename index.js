/**
 * Just a static file server for our frontend
 * should be in an AWS S3 Bucket and behind
 * a CloudFront Distribution
 */
const express = require('express');
const app = express();
const port = 3001;
const path = require('path');

app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

// eslint-disable-next-line
app.listen(port, () => console.log(`Listening on port ${port}!`));
