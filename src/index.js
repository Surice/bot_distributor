//require all packages
const Discord = require('discord.js');
const fs = require('fs')
const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf-8'));

//imports the storage required by the client
let stor = JSON.parse(fs.readFileSync(`${__dirname}/stor.json`).toString());

//defin the Discord Client
var client = new Discord.Client({ "partials": ['CHANNEL', 'MESSAGE', 'REACTION'] });


//init all required Variables
var reactMsg = "",
    react = "",
    reactRole = "",
    reactChannel = "",
    reactAddMsg = "";


console.log(`
:'######::'##::::'##:'########::'####::'######::'########:
'##... ##: ##:::: ##: ##.... ##:. ##::'##... ##: ##.....::
 ##:::..:: ##:::: ##: ##:::: ##:: ##:: ##:::..:: ##:::::::
. ######:: ##:::: ##: ########::: ##:: ##::::::: ######:::
:..... ##: ##:::: ##: ##.. ##:::: ##:: ##::::::: ##...::::
'##::: ##: ##:::: ##: ##::. ##::: ##:: ##::: ##: ##:::::::
. ######::. #######:: ##:::. ##:'####:. ######:: ########:
:......::::.......:::..:::::..::....:::......:::........::
`);

//starting Client...
console.log("Loading packages...");
client.on('ready', () => {
    console.log(`Successfully logged in as: ${client.user.tag} \n`);

    //set the activity of Client
    client.user.setActivity("Watching for Reactions");
});

//Bot Message on Event.
client.on('message', async (msg) => {
    msg.channel.messages.fetch({ limit: 2 }).then(async messages => {
        let secondLastMsg = messages.last().content;
        console.log(secondLastMsg);
        if (secondLastMsg == 'which message should be sent?') {
            reactMsg = msg.content;
            msg.channel.send("which emojie should be reacted with?");
        }
        else if (secondLastMsg == 'which emojie should be reacted with?') {
            react = msg.content;

            msg.channel.send("please paste in the role id");
            msg.channel.send("which role should be added for reaction?");
        }
        else if (secondLastMsg == 'which role should be added for reaction?') {
            reactRole = msg.content;
            msg.channel.send("in which channel should I post?");
        }
        else if (secondLastMsg == 'in which channel should I post?') {
            reactChannel = msg.content;
            if (msg.content.startsWith("<#")) {
                var temp = await reactChannel.substr(2).slice(0, -1);
                reactChannel = temp;
            }
        }

        else if(secondLastMsg == 'in which channel is the message to add the react?'){
            reactChannel = msg.content;
            if (msg.content.startsWith("<#")) {
                var temp = await reactChannel.substr(2).slice(0, -1);
                reactChannel = temp;
            }
            msg.channel.send("please paste in the message id");
            msg.channel.send("to which message should a reaction be added?");
        }
        else if(secondLastMsg == 'to which message should a reaction be added?'){
            reactAddMsg = msg.content;
            
            msg.channel.send("which emojie should be added?");
        }
        else if(secondLastMsg == 'which emojie should be added?'){
            react = msg.content;
            msg.channel.send("please paste in the role id");
            msg.channel.send("which role should be added for the reaction?");
        }
        else if(secondLastMsg == 'which role should be added for the reaction?'){
            reactRole = msg.content;
        }


        //if all Var´s for successfull reaction add
        if(reactChannel &&reactAddMsg && react && reactRole){
            reactChannel = await client.channels.fetch(reactChannel);
            reactAddMsg = await reactChannel.messages.fetch(reactAddMsg);

            await reactAddMsg.react(react);
            
            //new Monitoring Reactions Init and Upload
            var output = new Array(reactAddMsg.id, react, reactRole);
            stor.push(output);
            fs.writeFileSync(`${__dirname}/stor.json`, JSON.stringify(stor));
        }

        //if all Var´s for successfull reaction message create
        if (reactMsg && react && reactRole && reactChannel) {
            reactChannel = await client.channels.fetch(reactChannel);
            reactChannel.send(reactMsg).then(async function (reamsg) {
                console.log("> " + react);
                await reamsg.react(react);

                //new Monitoring Messages Init and Upload
                var output = new Array(reamsg.id, react, reactRole);
                stor.push(output);
                fs.writeFileSync(`${__dirname}/stor.json`, JSON.stringify(stor));
            });
        }
    });

    //main script for bot commands
    if (msg.content.startsWith(config.prefix) && msg.author.id != client.user.id) {
        var content = msg.content.substr(config.prefixlength).split(' ');
        if (msg.author.id == config.owner) {
            if (content[0] == "create") {
                msg.channel.send("which message should be sent?");
            }
            else if (content[0] == "add") {
                msg.channel.send("in which channel is the message to add the react?");
            }
        }
    }
})

//Bot Reaction on Event
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();

    //check for monitoring Messages/Reactions
    if (user.id != client.user.id) {
        const monitoring = monMsg(reaction);
        if (monitoring != null) {
            response = "";
            
            //for each loop for multiple reacts on message 
            monitoring.forEach(function(element, index){
                if(stor[element][1] == reaction.emoji.name){
                    response = index;
                }
            });

            //define the role and convert the user into member
            const role = await reaction.message.guild.roles.fetch(stor[monitoring[response]][2]);
            const member = await reaction.message.guild.members.fetch(user.id);

            //Add´s finaly the role to the user
            member.roles.add(role);
        }
    }
})
//bot Reaction remove on Event
client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();

    //check for monitoring Messages/Reactions
    if (user.id != client.user.id) {
        const monitoring = monMsg(reaction);
        if (monitoring != null) {
            response = "";

             //for each loop for multiple reacts on messag
            monitoring.forEach(function(element, index){
                if(stor[element][1] == reaction.emoji.name){
                    response = index;
                }
            });

            //define the role and convert the user into member
            const role = await reaction.message.guild.roles.fetch(stor[monitoring[response]][2]);
            const member = await reaction.message.guild.members.fetch(user.id);

            //removes finaly the role of the user
            member.roles.remove(role);
        }
    }
})

//check for all Monitoring Reactions and Push them into array
function monMsg(reaction) {
    var response = new Array();

    stor.forEach(function (element, index) {
        if (element.includes(reaction.message.id)) {
            response.push(index);
        }
    });
    console.log("> " + response);
    return response
}


client.login(config.token);