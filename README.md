# Playwright Email Sender

Automate Gmail email sending using Playwright.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Baromental/playwright-demo.git
   cd playwright-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gmail credentials:
   ```
   PORT=3000
   GMAIL_EMAIL=YOUR_EMAIL@GMAIL.COM
   GMAIL_PASSWORD=YOUR_PASSWORD
   GMAIL_CODE=SECRET_CODE  
   ```

### Running the Application

1. Start the application:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Usage

Send a POST request to `http://localhost:3000/api/send-email` with the following JSON body:

```json
{
    "to": "example@gmail.com",
    "subject": "Test from Playwright",
    "message": "This is a test email sent via Playwright!",
    "attachmentPath": "path/to/file"  // Optional
}
```