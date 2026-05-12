import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const smsProvider = {
  send: async ({ to, message }: { to: string; message: string }) => {
    try {
      // Twilio requires numbers in E.164 format (e.g., +1234567890)
      // If your mobile doesn't have a '+', you'll need to prepend it
      const formattedTo = to.startsWith('+') ? to : `+${to}`;

      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER, // Your purchased Twilio number
        to: formattedTo,
      });

      return { success: true, sid: response.sid };
    } catch (error) {
      console.error('SMS Send Error:', error);
      return { success: false, error };
    }
  },
};