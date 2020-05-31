const Discord = require('discord.js');
const fs = require('fs')
const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf-8'));

let stor = JSON.parse(fs.readFileSync(`${__dirname}/stor.json`).toString());

var client = new Discord.Client({ "partials": ['CHANNEL', 'MESSAGE', 'REACTION'] }),
    reactMsg = "",
    react = "",
    reactRole = "",
    reactChannel = "",
    reactAddMsg = "";

console.log("Loading packages...");
client.on('ready', () => {
    console.log(`Successfully logged in as: ${client.user.tag} \n`);

    client.user.setActivity("Watching for Reactions");
});

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



        if(reactChannel &&reactAddMsg && react && reactRole){
            reactChannel = await client.channels.fetch(reactChannel);
            reactAddMsg = await reactChannel.messages.fetch(reactAddMsg);

            await reactAddMsg.react(react);
            
            var output = new Array(reactAddMsg.id, react, reactRole);
            stor.push(output);
            fs.writeFileSync(`${__dirname}/stor.json`, JSON.stringify(stor));
        }

        if (reactMsg && react && reactRole && reactChannel) {
            reactChannel = await client.channels.fetch(reactChannel);
            reactChannel.send(reactMsg).then(async function (reamsg) {
                console.log("> " + react);
                await reamsg.react(react);

                var output = new Array(reamsg.id, react, reactRole);

                stor.push(output);
                fs.writeFileSync(`${__dirname}/stor.json`, JSON.stringify(stor));
            });
        }
    });

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

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();

    if (user.id != client.user.id) {
        const monitoring = monMsg(reaction);
        if (monitoring != null) {
            response = "";
            
            monitoring.forEach(function(element, index){
                if(stor[element][1] == reaction.emoji.name){
                    response = index;
                }
            });

                const role = await reaction.message.guild.roles.fetch(stor[monitoring[response]][2]);
                const member = await reaction.message.guild.members.fetch(user.id);

                member.roles.add(role);
        }
    }
})
client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();

    if (user.id != client.user.id) {
        const monitoring = monMsg(reaction);
        if (monitoring != null) {
            response = "";

            monitoring.forEach(function(element, index){
                if(stor[element][1] == reaction.emoji.name){
                    response = index;
                }
            });
                const role = await reaction.message.guild.roles.fetch(stor[monitoring[response]][2]);
                const member = await reaction.message.guild.members.fetch(user.id);

                member.roles.remove(role);
        }
    }
})


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