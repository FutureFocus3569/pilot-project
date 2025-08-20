import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface WelcomeEmailData {
  name: string
  email: string
  password: string
  organizationName: string
  loginUrl: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, password, organizationName, loginUrl }: WelcomeEmailData = await req.json()

    // Create the HTML email content
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${organizationName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0891b2, #22d3ee); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${organizationName}!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account has been created</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <h2 style="color: #0891b2; margin-top: 0;">Hello ${name}!</h2>
        
        <p>Welcome to ${organizationName}'s Childcare Management System! Your account has been successfully created with the following details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</span></p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #1e40af;">Getting Started</h3>
            <ol style="margin: 0; padding-left: 20px;">
                <li>Click the login button below</li>
                <li>Use your email and temporary password to sign in</li>
                <li>Change your password on first login for security</li>
                <li>Explore your dashboard and assigned centre permissions</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #0891b2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Login to Dashboard
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #374151;">Need Help?</h3>
            <p>If you have any questions or need assistance, please contact your administrator or IT support.</p>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This email was sent by ${organizationName} Childcare Management System<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>`

    // Send email using Resend API through Supabase Edge Function
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@futurefocus.co.nz',
        to: [email],
        subject: `Welcome to ${organizationName} - Your Account is Ready`,
        html: emailContent,
      }),
    })

    const result = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        message: 'Welcome email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
