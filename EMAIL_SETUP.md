# Email Setup Instructions

## Overview
The system is now configured to automatically send welcome emails to new users when they are created through the admin panel.

## Email Service Setup (Resend)

### 1. Create a Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get your API Key
1. Log in to your Resend dashboard
2. Go to "API Keys" in the left sidebar
3. Click "Create API Key"
4. Give it a name like "Future Focus Childcare Dashboard"
5. Copy the API key (starts with `re_`)

### 3. Update Environment Variables
Open your `.env` file and update:
```
RESEND_API_KEY="re_your_actual_api_key_here"
FROM_EMAIL="noreply@futurefocus.co.nz"
```

### 4. Domain Setup (Optional but Recommended)
For production use, you should verify your domain:
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `futurefocus.co.nz`)
3. Follow the DNS verification steps
4. Once verified, update `FROM_EMAIL` to use your domain

## Alternative: Using Gmail SMTP (If you prefer)

If you'd rather use Gmail, we can configure Nodemailer instead:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Update the email service to use SMTP

## What Happens When You Create a User

1. User account is created in the database
2. Password is hashed and stored securely
3. Welcome email is automatically sent with:
   - User's login credentials
   - Direct link to the dashboard
   - Instructions to change password
   - Professional Future Focus branding

## Email Template Features

✅ Professional HTML email template
✅ Future Focus branding and colors
✅ Secure credential delivery
✅ Password change reminder
✅ Responsive design for mobile/desktop
✅ Security best practices

## Testing the Email System

1. Make sure your `.env` file has the correct `RESEND_API_KEY`
2. Restart your development server: `npm run dev`
3. Go to Admin → User Management
4. Add a new user
5. Check the console for email confirmation
6. Check the recipient's email inbox

## Troubleshooting

### "Failed to send welcome email"
- Check your Resend API key is correct
- Verify you have internet connection
- Check the console logs for specific error messages

### Email not received
- Check spam/junk folder
- Verify the email address is correct
- Check Resend dashboard for delivery status

### Production Considerations
- Set up domain verification in Resend
- Use a professional from address
- Monitor email delivery rates
- Consider setting up email analytics

## Cost
- Resend free tier: 3,000 emails/month
- Perfect for most childcare centers
- Upgrade plans available if needed

## Support
If you need help setting this up, the system will still work without emails - users just won't get automatic welcome messages.
