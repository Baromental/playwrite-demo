import dotenv from 'dotenv';
import express, { Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';

import EmailService from './services/email.service';
import { ApiResponse, EmailRequest } from 'interfaces';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(bodyParser.json());

app.post('/api/send-email', async (req: EmailRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { to, subject, message, attachmentPath } = req.body;
        
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, and message are required' 
      });
    }

    const result = await EmailService.sendGoogleEmail({
      to,
      subject,
      message,
      attachmentPath
    });

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
