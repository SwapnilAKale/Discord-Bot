const { Client, GatewayIntentBits } = require('discord.js');
const Shortid = require("shortid");
const mongoose = require("mongoose");
const express = require("express");

const app = express();
const port = 8002;

mongoose.connect("mongodb://127.0.0.1:27017/discord-URL-Shortener")
.then(() => console.log("MongoDB Connected"));

const URLSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
    redirectURL: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const URL = mongoose.model("URL", URLSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.content.startsWith("create")) {
        const url = message.content.split("create")[1];
        const shortID = Shortid();

        try {
            const check = await URL.create({
                shortId: shortID,
                redirectURL: url,
            });
            console.log(check);

            await message.reply({
                content: `Generating Short ID for ${url}\nShortId is - http://localhost:8002/url/${shortID}`,
            });
        } catch (error) {
            console.error('Error creating URL:', error);
            await message.reply({
                content: 'There was an error creating the short URL. Please try again later.',
            });
        }
    } else {
        message.reply({
            content: 'Hi from Bot',
        });
    }
});

client.on("interactionCreate", interaction => {
    console.log(interaction);
    interaction.reply("pong");
});

app.use(express.json());

app.get("/url/:shortId", async (req, res) => {
    const { shortId } = req.params.shortId;
    try {
        const url = await URL.find({ shortId });
        if (url) {
            res.redirect(url.redirectURL);
        } else {
            res.status(404).send("URL not found");
        }
    } catch (error) {
        console.error('Error retrieving URL:', error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete("/url/:shortId",async(req,res) => {
    const shortId = req.params.shortId;
    const urls = await URL.findOneAndDelete({shortId});
    return res.json({msg:"Success"});
});

app.listen(port, () => console.log(`Server Started: ${port}`));
client.login("MTI0MjkyNDEyOTUzMTk5MDAzNw.G8B4rw.IgIy89HWDXo0LEcgj2TEHEeN22YZYxhtHzE8f4");
