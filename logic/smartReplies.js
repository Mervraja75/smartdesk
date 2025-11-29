//==================================
// PURPOSE
//==================================
// This file contains SmartDesk's keyword-based replies.

//==================================
// IMPORTS
//==================================

//==================================
// DATA
//==================================
export const smartReplies = [ //export= Chatscreen, const= value doesnt change, smartReplies= name of the data
    {
        keywords: ["wifi", "wi-fi", "internet"], //keywords to look for in the user's message
        reply: "Try reconnecting to the Wi-Fi or toggling Airplane Mode. If the issue continues, check if other devices have the same problem.",
    },

    {
        keywords: ["printer", "printing", "print"], //keywords for printer words
        reply: "Check if the printer is online and selected correctly. Make sure it has paper and is not paused.",
    },

    {
        keywords: ["email", "outlook", "mail", "gmail"], //keywords for mail
        reply: "Try restarting Outlook or re-adding your account. Also check if your mailbox storage is full.",
    },

    {
        keywords: ["password", "reset", "forgot"], //keywords for password
        reply: "You can reset your password using the official reset page. After resetting, wait 5 minutes for the changes to sync.",
    },

    {
    keywords: ["vpn", "globalprotect", "connect"],
    reply: "Ensure GlobalProtect is installed and you're signed in. If it keeps disconnecting, restart your device and try again.",
    },

]

//==================================
// LOGIC
//==================================

export function getReply(userMessage) { 
    const message = userMessage.toLowerCase(); //convert everything to lowercase

    for (let entry of smartReplies) { //for = start a loop, smartReplies = loop over the created array
        for (let keyword of entry.keywords){ //looping through keywords
            if (message.includes(keyword)){ //check if keyword appears
                return entry.reply; //stops function & sends back correct message
            }

        } 
    }

    return "I'm still learning about that issue. Try rephrasing or giving more details!"; // no keyword matched = default reply.

}
