const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/lookup', async (req, res) => {
  const { username, type } = req.body;
  console.log('🌐 Body received:', req.body);

  if (!username || !type) {
    return res.status(400).json({ error: 'Username and type are required.' });
  }

  try {
    // Step 1: Get userId from username
    const userRes = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      { usernames: [username], excludeBannedUsers: true },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = userRes.data.data[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = user.id;
    let endpoint = '';

    // Step 2: Select the correct API endpoint
    if (type === 'friends') {
      endpoint = `https://friends.roblox.com/v1/users/${userId}/friends`;
    } else if (type === 'followers') {
      endpoint = `https://friends.roblox.com/v1/users/${userId}/followers`;
    } else if (type === 'following') {
      endpoint = `https://friends.roblox.com/v1/users/${userId}/followings`;
    } else {
      return res.status(400).json({ error: 'Invalid type.' });
    }

    // Step 3: Fetch the user list
    const listRes = await axios.get(endpoint);
    const users = listRes.data.data.map(user => user.name);

    // Step 4: Send response
    res.json({
      type,
      users
    });

  } catch (err) {
    console.error('❌ Error fetching data:', err.message);
    res.status(500).json({ error: 'Internal server error or rate limit reached.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Roblox proxy server running at http://localhost:${port}`);
});
