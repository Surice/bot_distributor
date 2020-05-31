const Discord = require('discord.js');
const fs = require('fs')
const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`,'utf-8'));

let stor = JSON.parse(fs.readFileSync(`${__dirname}/stor.json`).toString());

var client = new Discord.Client({"partials": ['CHANNEL', 'MESSAGE', 'REACTION']}),
    reactMsg = "",
    react = "",
    reactRole = "",
    reactChannel = "";

console.log("Loading packages...");
client.on('ready', ()=>{
    console.log(`Successfully logged in as: ${client.user.tag} \n`);

    client.user.setActivity("Watching for Reactions");
});

client.on('message', async (msg)=>{
    msg.channel.messages.fetch({ limit: 2 }).then(async messages => {
        let secondLastMsg = messages.last().content;
    console.log(secondLastMsg);
    if(secondLastMsg == 'which message should be sent?'){
        reactMsg = msg.content;
        msg.channel.send("which emojie should be reacted with?");
    }
    else if(secondLastMsg == 'which emojie should be reacted with?'){
        react = msg.content;
        
        msg.channel.send("please paste in the role id");
        msg.channel.send("which role should be added for reaction?");
    }
    else if(secondLastMsg == "which role should be added for reaction?"){
        reactRole = msg.content;
        msg.channel.send("in which channel should I post?");
    }
    else if(secondLastMsg == "in which channel should I post?"){
        reactChannel = msg.content;
        if(msg.content.startsWith("<#")){
            var temp = await reactChannel.substr(2).slice(0,-1);
            reactChannel = temp;
        }
    }

    if(reactMsg && react && reactRole && reactChannel){
        reactChannel = await client.channels.fetch(reactChannel);
        reactChannel.send(reactMsg).then(async function(reamsg){
            console.log("> " +react);
            await reamsg.react(react);

            var output = new Array(reamsg.id, react, reactRole);

            stor.push(output);
            fs.writeFileSync(`${__dirname}/stor.json`, JSON.stringify(stor));
            console.log(stor);
        });

    }

    });

    if(msg.content.startsWith(config.prefix) && msg.author.id != client.user.id){
        var content = msg.content.substr(config.prefixlength).split(' ');

        if(msg.author.id == config.owner && content[0] == "add"){
            msg.channel.send("which message should be sent?");
        }
    }
})

client.on('messageReactionAdd', async (reaction, user)=>{
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.id != client.user.id){
        const monitoring = monMsg(reaction);
        if(monitoring){
            console.log("true");
        }
    }
})


function monMsg(reaction){
    var response = false;

    stor.forEach(function(element, index){
        if(element.includes(reaction.message.id)){
            response = index;
        }
    });
    console.log("> " +response);
    return response
}


client.login(config.token);