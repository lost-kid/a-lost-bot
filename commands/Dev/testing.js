const fs = require('fs');
module.exports = {
  name: 'testing',
  description: '',
  aliases: ['t'],
  cooldown: 3,
  args: false,
  usage: '[Permission Role] [New Server Role]',
  permission: true,
  roles: ["Owner", "Admin"],
  guildOnly: true,
  execute: async (msg, args, connection) => {

    const sql = "SELECT rollId FROM rolls WHERE rollName = 'Overseers'";
    connection.query(sql, function (err, result) {
      if (err) {Sentry.captureException(err); return;}
      msg.channel.send('Roll Id from DB: ' + result[0].rollId);
    });

    // const permissionRole = args[0];
    // const serverRole = args[1];

    // const data = JSON.stringify(permissions, null, 4);

    // fs.readFile('./assets/permissions.json', 'utf-8', function(err, data) {
    //   if (err) throw err;
    //   console.log("1");
    
    //   const arrayOfObjects = JSON.parse(data);
    //   arrayOfObjects[permissionRole].push(serverRole);
    //   fs.writeFile('./users.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
    //     console.log("2");
    //     if (err) throw err;
    //     console.log("3");
    //   });
    // });

    //This is for the other args that are needed make a real check
    // if (args.length < 2) {

    // }

    // let data = JSON.parse(permissions);
    // console.log(data);

    // fs.readFile('./assets/permissions.json', function (err, data) {
    //   const json = JSON.parse(data);
    //   const serverRoles = json[`${permissionRole}`];


    // });
  },
};