// Static memes data
// Images are served from /uploads/images/ via Express static middleware (located in server/public/uploads/images/)
const cryptoMemes = [
  { id: '1', url: '/uploads/images/meme1.png', title: 'Watching market dump 30% after you shilled #BTC ETF to your entire family last week' },
  { id: '2', url: '/uploads/images/meme2.png', title: 'Bitcoin memes 2025' },
  { id: '3', url: '/uploads/images/meme3.png', title: 'Hindsight is a beautiful thing…' },
  { id: '4', url: '/uploads/images/meme4.png', title: 'Well, Boys, Looks Like It Is Time To Sell' },
  { id: '5', url: '/uploads/images/john-wick-vs-john-weak-crypto-meme.png', title: 'John Wick vs John Weak' },
  { id: '6', url: '/uploads/images/my-real-job-meme.png', title: 'My real job is not a job' },
  { id: '7', url: '/uploads/images/trading-crypto.jpg', title: 'Trading crypto be like' },
];

// Get random meme
const getRandomMeme = () => {
  return cryptoMemes[Math.floor(Math.random() * cryptoMemes.length)];
};

module.exports = {
  getRandomMeme,
};

