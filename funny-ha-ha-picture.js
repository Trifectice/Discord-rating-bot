require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

// Object to store photo submissions
// Structure: { 'photoID': { userID: '123', ratings: [], url: 'http://...' } }
const submissions = {};

// Object to track user ratings for '9's and '10's
// Structure: { 'userID': { '9': countOf9sThisWeek, '10': countOf10sThisWeek } }
const userRatings = {};

// Helper function to generate a simple unique ID for each photo
function generatePhotoID() {
    return `photo-${Object.keys(submissions).length + 1}`;
}

// Helper function to get rating from emoji
function getRatingFromEmoji(emoji) {
    const emojiRatings = {
        '1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4, '5️⃣': 5,
        '6️⃣': 6, '7️⃣': 7, '8️⃣': 8, '9️⃣': 9, '🔟': 10
    };
    return emojiRatings[emoji] || null;
}

// Calculate and announce winners, then reset
function calculateAndAnnounceWinners() {
    // Similar logic as previously described for calculating winners
    // Reset submissions and userRatings for the next week
}

// Weekly reset and winner announcement
function weeklyReset() {
    calculateAndAnnounceWinners(); // Your existing logic
    // Reset user ratings
    for (const userID in userRatings) {
        userRatings[userID] = { '9': 0, '10': 0 };
    }
}

client.once('ready', () => {
    console.log('Ready!');
    // Set up a weekly reset
    setInterval(weeklyReset, 1000 * 60 * 60 * 24 * 7); // Resets weekly
});

client.on('message', async message => {
    if (message.channel.name === 'art-gallery' && message.attachments.size > 0) {
        const photoID = generatePhotoID();
        const sentMessage = await message.channel.send(`Photo submitted with ID: ${photoID}`);
        submissions[photoID] = {
            userID: message.author.id,
            ratings: [],
            url: message.attachments.first().url // Assuming one photo per message
        };

        // React with number emojis for ratings
        const ratingEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        for (const emoji of ratingEmojis) {
            await sentMessage.react(emoji);
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channel.name === 'art-gallery' && !user.bot) {
        const rating = getRatingFromEmoji(reaction.emoji.name);
        if (!rating) return; // If the emoji is not a rating emoji, ignore it

        const userID = user.id;
        if (rating === 9 || rating === 10) {
            if (!userRatings[userID]) {
                userRatings[userID] = { '9': 0, '10': 0 };
            }

            if (userRatings[userID][rating] >= 3) {
                await reaction.users.remove(user.id);
                let ratingLimitMessage = `You've reached your limit of '${rating}' ratings for this week.`;
                user.send(ratingLimitMessage);
            } else {
                userRatings[userID][rating]++;
                // Here, you'd also need to update the submission's ratings
                // This part of the logic is omitted for brevity but involves tracking which photo the reaction corresponds to
            }
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

