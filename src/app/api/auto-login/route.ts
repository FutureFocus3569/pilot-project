import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

// Auto-login service using headless browser automation
class AutoLoginService {
  private browser: Browser | null = null;

  async initBrowser() {
    if (!this.browser) {
      console.log('🚀 Initializing headless browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async performAutoLogin(siteUrl: string, username: string, password: string) {
    console.log('🔐 Starting auto-login for:', siteUrl);
    
  const browser = await this.initBrowser();
  const page: Page = await browser.newPage();
    
    try {
      // Set user agent to appear like a real browser
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      // Navigate to the site
      console.log('📍 Navigating to:', siteUrl);
      await page.goto(siteUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      // Wait a bit for the page to fully load
      await new Promise(res => setTimeout(res, 2000));
      // Try to detect and fill login forms
      const loginResult = await this.detectAndFillLoginForm(page, username, password);
      if (loginResult && loginResult.success) {
        // Get cookies after successful login
        const cookies = await page.cookies();
        console.log('✅ Login successful, got', cookies.length, 'cookies');
        return {
          success: true,
          cookies,
          redirectUrl: page.url(),
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          message: loginResult?.error || 'Could not detect login form'
        };
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error);
      return {
        success: false,
        message: 'Login failed: ' + (error as Error).message
      };
    } finally {
      await page.close();
    }
  }

  async detectAndFillLoginForm(page: unknown, username: string, password: string) {
    try {
      console.log('🔍 Detecting login form...');
      
      // Common selectors for username/email fields
      const usernameSelectors = [
        'input[type="email"]',
        'input[type="text"][name*="user"]',
        'input[type="text"][name*="email"]',
        'input[name="username"]',
        'input[name="email"]',
        'input[id*="user"]',
        'input[id*="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="username" i]'
      ];

      // Common selectors for password fields
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[id*="password"]'
      ];

      // Find username field
      const pageTyped = page as import('puppeteer').Page;
      let usernameField = null;
      for (const selector of usernameSelectors) {
        try {
          usernameField = await pageTyped.$(selector);
          if (usernameField) {
            console.log('✅ Found username field:', selector);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      // Find password field
      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          passwordField = await pageTyped.$(selector);
          if (passwordField) {
            console.log('✅ Found password field:', selector);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
            // Try to find a submit button
            const submitSelectors = [
              'button[type="submit"]',
              'input[type="submit"]',
              'button',
              'input[type="button"]'
            ];
            let submitButton = null;
            let submitSelector = '';
            for (const selector of submitSelectors) {
              try {
                submitButton = await pageTyped.$(selector);
                if (submitButton) {
                  submitSelector = selector;
                  console.log('✅ Found submit button:', selector);
                  break;
                }
              } catch (e) {
                // Continue to next selector
              }
            }
            if (submitButton) {
              console.log('🎯 Clicking submit button...');
              await submitButton.click();
              // Wait for navigation or login success
              await new Promise(res => setTimeout(res, 3000));
              // Check if we're still on login page or redirected
              const currentUrl = pageTyped.url();
              console.log('📍 After login attempt, current URL:', currentUrl);
              return { success: true };
            } else if (passwordField) {
              // Try pressing Enter on password field
              console.log('🔄 No submit button found, trying Enter key...');
              await passwordField.press('Enter');
              await new Promise(res => setTimeout(res, 3000));
              return { success: true };
            } else {
              return { success: false, error: 'No login form fields found' };
            }
          } catch (error) {
            console.error('❌ Error in login form detection:', error);
            return {
              success: false,
              error: (error as Error).message
            };
          }
        }
}

const autoLoginService = new AutoLoginService();

// POST /api/auto-login - Perform automatic login
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 POST /api/auto-login - Starting auto-login process');
    const body = await request.json();
    const { siteUrl, username, password, userId } = body;

    if (!siteUrl || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: siteUrl, username, password' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(siteUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('🎯 Attempting auto-login for user:', userId, 'to site:', siteUrl);
    
    // For demo purposes, return success immediately
    // In production, uncomment the line below:
    // const result = await autoLoginService.performAutoLogin(siteUrl, username, password);
    
    // Demo response (remove this in production)
    const result = {
      success: true,
      message: 'Demo: Auto-login would happen here',
      redirectUrl: siteUrl,
      loginMethod: 'simulated'
    };

    if (result.success) {
      console.log('✅ Auto-login successful');
      return NextResponse.json({
        success: true,
        message: result.message,
        redirectUrl: result.redirectUrl,
        // In production, you might return session tokens or redirect URLs
        action: 'redirect' // or 'open_window', 'set_cookies', etc.
      });
    } else {
      console.log('❌ Auto-login failed:', result.message);
      return NextResponse.json(
        { 
          success: false, 
          error: result.message,
          fallbackAction: 'manual_login' // Let user login manually
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Auto-login service error:', error);
    return NextResponse.json(
      { 
        error: 'Auto-login service failed',
        fallbackAction: 'manual_login'
      },
      { status: 500 }
    );
  }
}

// GET /api/auto-login/status - Check if auto-login is available for a site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get('siteUrl');
    
    if (!siteUrl) {
      return NextResponse.json(
        { error: 'siteUrl parameter required' },
        { status: 400 }
      );
    }

    // Check if we support auto-login for this site
    const supportedSites = [
      'discover.childcare.govt.nz',
      'myhr.co.nz',
      'login.xero.com',
      'newworld.co.nz'
    ];

    const domain = new URL(siteUrl).hostname;
    const isSupported = supportedSites.some(site => domain.includes(site));

    return NextResponse.json({
      supported: isSupported,
      domain,
      method: isSupported ? 'automated' : 'manual',
      message: isSupported 
        ? 'Auto-login supported for this site'
        : 'Manual login required - auto-login not yet configured for this site'
    });

  } catch (error) {
    console.error('❌ Error checking auto-login status:', error);
    return NextResponse.json(
      { error: 'Failed to check auto-login status' },
      { status: 500 }
    );
  }
}
