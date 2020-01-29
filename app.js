const fs = require('fs');
const junk = require('junk');
const Discord = require('discord.js');
const mysql = require('mysql');
const { TOKEN, owner_id, dnsStr, host, port, user, password, database, prefix } = require('./assets/config.json');

var connection = mysql.createConnection({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database
});

const Sentry = require('@sentry/node');
Sentry.init({ dsn: dnsStr });

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

connection.connect(function(err) {
  if (err) {Sentry.captureException(err); return;}
  console.log("connected");
  // const sql = "SELECT rollId FROM rolls WHERE rollName = 'Overseers'";
  // connection.query(sql, function (err, result) {
  //   if (err) {Sentry.captureException(err); return;}
  //   console.log(result);
  // });
});


fs.readdir('./commands', (err, data) => {
  if (err) {
    Sentry.captureException(err);
  }
  try {
    const commandFolders = data.filter(junk.not);
    for (const files of commandFolders) {
      const file = fs.readdirSync(`./commands/${files}`);
      for (const single of file) {
        const command = require(`./commands/${files}/${single}`);
        client.commands.set(command.name, command);
      }
    }
  }
  catch (err) {
    Sentry.captureException(err);
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName),
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('Global command only');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${
        command.usage
      }\``;
    }
    return message.channel.send(reply);
  }

  // // PERMISSOIONS
  // if (command.permission) {
  //   for (const key in permissions) {
  //     const dcordRoleNames = permissions[key];
  //     if (message.member.roles.some(oneDcordRole => dcordRoleNames.includes(oneDcordRole.name))) {
  //       if (!message.member.roles.some(r => command.roles.includes(r.name))) {
  //         return message.channel.send('You do not have the creds for this');
  //       }
  //     }
  //   }
  // }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1,
        )} more second(s) before reusing the \`${command.name}\` command.`,
      );
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args, connection);
  }
  catch (err) {
    Sentry.captureException(err);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(TOKEN);
