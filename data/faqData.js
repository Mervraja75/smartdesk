// faqData.js
// Local Knowledge Base for SmartDesk
// Each object = one FAQ (question + answer + category)

export const faqData = [
  {
    id: 1,
    category: 'Network',
    question: 'Why is my Wi-Fi not connecting?',
    answer:
      'Check if airplane mode is off and Wi-Fi is enabled. Restart your router. If the issue persists, forget and reconnect to the network.',
  },
  {
    id: 2,
    category: 'Printer',
    question: 'The printer is not responding. What should I do?',
    answer:
      'Ensure the printer is powered on and connected to the same network. Restart both the printer and your device. If still unresponsive, reinstall the printer driver.',
  },
  {
    id: 3,
    category: 'Email',
    question: 'I cannot send emails from my Outlook account.',
    answer:
      'Verify that you are connected to the internet, then check your SMTP server settings. Try logging in via the web to confirm credentials.',
  },
  {
    id: 4,
    category: 'Software',
    question: 'How do I install Microsoft Teams?',
    answer:
      'Visit the official Microsoft Teams website, download the installer for macOS or Windows, and follow the setup instructions.',
  },
  {
    id: 5,
    category: 'Account',
    question: 'How do I reset my school account password?',
    answer:
      'Go to the IT portal → Account Recovery → Reset Password. You’ll need your student ID and secondary email.',
  },
];