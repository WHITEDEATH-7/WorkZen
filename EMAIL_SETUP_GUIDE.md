# Real Email Setup Guide

## Option 1: EmailJS (Recommended - FREE)

### Step 1: Install EmailJS
```bash
npm install @emailjs/browser
```

### Step 2: Create EmailJS Account
1. Go to: https://www.emailjs.com/
2. Sign up for FREE account
3. Verify your email

### Step 3: Setup Email Service
1. Login to EmailJS dashboard
2. Go to **Email Services**
3. Click **Add New Service**
4. Choose your email provider (Gmail recommended)
5. Connect your Gmail account
6. Copy the **Service ID**

### Step 4: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

```
Subject: {{subject}}

To: {{to_name}} ({{to_email}})

{{message}}

Login ID: {{login_id}}
Password: {{password}}
```

4. Save and copy the **Template ID**

### Step 5: Get Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

### Step 6: Update Code in `src/utils/auth.ts`

Uncomment and replace lines 102-123 with your credentials:

```typescript
import emailjs from '@emailjs/browser';

export const sendCredentialsEmail = async (
  email: string,
  loginId: string,
  password: string,
  firstName: string
): Promise<void> => {
  const emailData = {
    to: email,
    subject: 'Your WorkZen HRMS Account Credentials',
    body: `Dear ${firstName},...`,
    timestamp: new Date().toISOString(),
  };
  
  try {
    await emailjs.send(
      'service_xxxxxxx',  // Your Service ID
      'template_xxxxxx',  // Your Template ID
      {
        to_email: email,
        to_name: firstName,
        subject: emailData.subject,
        message: emailData.body,
        login_id: loginId,
        password: password,
      },
      'YOUR_PUBLIC_KEY_HERE' // Your Public Key
    );
    
    console.log('✅ Real Email Sent!');
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
  
  // Keep mock email for testing
  localStorage.setItem(`mock_email_${Date.now()}`, JSON.stringify(emailData));
};
```

---

## Option 2: Nodemailer (Backend Required)

### Step 1: Create Backend API
Create `server.js`:

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password' // Generate from Google Account
    }
  });
  
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to,
      subject,
      text
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log('Email server running on port 5000'));
```

### Step 2: Update Frontend
In `src/utils/auth.ts`:

```typescript
export const sendCredentialsEmail = async (...) => {
  await fetch('http://localhost:5000/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Your WorkZen HRMS Account Credentials',
      text: emailData.body
    })
  });
};
```

---

## Quick Start (EmailJS - Easiest)

1. **Install**: `npm install @emailjs/browser`
2. **Signup**: https://www.emailjs.com/
3. **Get credentials**: Service ID, Template ID, Public Key
4. **Update code**: Uncomment lines in `src/utils/auth.ts`
5. **Test**: Add employee and check real email!

---

## Email Limits

- **EmailJS Free**: 200 emails/month
- **Gmail Direct**: 500 emails/day
- **Production**: Use SendGrid, AWS SES, or Mailgun

---

**Note**: For production, use a proper email service like SendGrid or AWS SES.
