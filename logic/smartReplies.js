//==================================
// PURPOSE
//==================================
// SmartDesk reply engine with weighted keyword matching
// to improve accuracy and reduce false positives.

//==================================
// DATA
//==================================
export const smartReplies = [
  {
    category: "wifi",
    keywords: [
      "wifi",
      "wi-fi",
      "internet",
      "no internet",
      "slow internet",
      "disconnected",
      "network issue",
      "can't connect",
      "cannot connect",
    ],
    reply: `Let’s troubleshoot your Wi-Fi step by step:

1️⃣ Make sure Wi-Fi is turned ON  
2️⃣ Reconnect to the network  
3️⃣ Restart your device  
4️⃣ Check if other devices have the same issue  

If it still doesn’t work:
• Phone or laptop?
• On campus or at home?`,
  },

  {
    category: "printer",
    keywords: [
      "printer offline",
      "print job",
      "print queue",
      "stuck printing",
      "not printing",
      "printer",
    ],
    reply: `Let’s troubleshoot your printer:

1️⃣ Make sure the printer is powered ON  
2️⃣ Check if it shows as “Offline”  
3️⃣ Clear stuck print jobs in the queue  
4️⃣ Confirm the correct printer is selected  
5️⃣ Restart both the printer and your device  

Still stuck?
• USB or Wi-Fi printer?
• Mac or Windows?`,
  },

  {
    category: "email",
    keywords: [
      "email not working",
      "not receiving email",
      "email setup",
      "email login",
      "email sync",
      "outlook",
      "gmail",
      "email",
    ],
    reply: `Let’s fix your email:

1️⃣ Check your internet connection  
2️⃣ Restart the email app  
3️⃣ Confirm your email address and password  
4️⃣ Check if your mailbox is full  
5️⃣ Try removing and re-adding the account  

Tell me:
• Outlook or Gmail?
• Phone or computer?`,
  },

  {
    category: "account",
    keywords: [
      "can't login",
      "cannot login",
      "forgot password",
      "password reset",
      "account locked",
      "verification code",
      "2fa",
      "two factor",
      "login",
      "password",
    ],
    reply: `Let’s fix your account access:

1️⃣ Check Caps Lock  
2️⃣ Re-enter your username and password  
3️⃣ Reset your password if needed  
4️⃣ Wait a few minutes before trying again  
5️⃣ If using 2FA, ensure your device time is correct  

Still stuck?
• Password issue or 2FA code?
• Phone or computer?`,
  },

  {
    category: "vpn",
    keywords: ["vpn", "globalprotect"],
    reply:
      "Make sure GlobalProtect is installed and signed in. If it disconnects, restart your device and try again.",
  },
];

//==================================
// LOGIC
//==================================

// Normalize text (lowercase + remove punctuation)
function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "");
}

// Score how many keywords match
function scoreEntry(message, entry) {
  let score = 0;

  for (let keyword of entry.keywords) {
    if (message.includes(keyword)) {
      score += keyword.split(" ").length; // longer phrases score higher
    }
  }

  return score;
}

export function getReply(userMessage) {
  const message = normalize(userMessage);

  let bestMatch = null;
  let highestScore = 0;

  for (let entry of smartReplies) {
    const score = scoreEntry(message, entry);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    return bestMatch.reply;
  }

  // Safe fallback
  return "I want to make sure I understand — could you tell me what device you’re using and what’s not working?";
}
