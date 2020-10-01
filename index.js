const Discord = require("discord.js");
const client = new Discord.Client();
const db = require("quick.db");
const config = require("./config.json");

client.on("ready", async () => {
  console.log('Invite Link:', await client.generateInvite(11264));
  console.log(`Booted Up!`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  //usage !global <#channel>

  if (command === "global") {
    const channel = message.mentions.channels.first();
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`You are missing the **MANAGE GUILD** permission!`)
    if (!channel)
      return message.channel.send(
        "Invalid Channel, Please mention a channel!!"
      );
    db.set(`g_${message.guild.id}`, `${channel.id}`);
    message.channel.send(`Global Chat Set to ${channel}!`);
  }
});

// Delete the guild from the db to prevent any errors.
client.on('guildDelete', g => {
  db.delete(`g_${g.id}`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) return;
  let set = db.fetch(`g_${message.guild.id}`);
  if (message.channel.id === set) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Username: " + message.author.tag)
      .addField("Message:", message.content)
      .setFooter(`Server: ${message.guild.name} || Members: ${message.guild.memberCount}`);
    // Throws error if the bot doesn't have perms to delete messages.
    message.delete().catch(() => console.log(`Bot is missing MANAGE_MESSAGES permission in Guild: ${message.guild.id}`));
    client.guilds.cache.forEach(g => {
      try {
        client.channels.cache.get(db.fetch(`g_${g.id}`)).send(embed);
      } catch (e) {
        return;
      }
    });
  }
});

client.login(config.token);