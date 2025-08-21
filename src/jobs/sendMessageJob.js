const { sendWhatsAppMessage } = require('../services/whatsappService');

const sendMessageJob = async (job) => {
    try {
        const { phoneNumber } = job.data;
        const template = 'monthly_hr_update'; // Pre-approved template
        await sendWhatsAppMessage(phoneNumber, template);
        console.info(`Message sent to ${phoneNumber}`);
    } catch (error) {
        console.error(`Failed to send message: ${error.message}`);
        throw error; // Rethrow error to allow Bull to handle retries
    }
};

module.exports = sendMessageJob;