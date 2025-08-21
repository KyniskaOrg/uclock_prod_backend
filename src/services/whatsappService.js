const axios = require('axios');
const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;

const sendWhatsAppMessage = async (phoneNumber, templateName, templateData) => {
    try {
        const response = await axios.post(`https://graph.facebook.com/v13.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: 'en_US'
                },
                components: [
                    {
                        type: 'body',
                        parameters: templateData
                    }
                ]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send WhatsApp message');
    }
};

module.exports = {
    sendWhatsAppMessage
};