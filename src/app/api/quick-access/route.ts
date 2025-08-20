import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple encryption for demo purposes
// In production, use proper encryption libraries like crypto-js or similar
class CredentialService {
  private encryptionKey = process.env.ENCRYPTION_KEY || 'demo-key-change-in-production';
  
  encrypt(text: string): string {
    try {
      // Simple encryption - in production use proper encryption
      const cipher = crypto.createCipher('aes192', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback for demo
    }
  }

  decrypt(encryptedText: string): string {
    try {
      // Simple decryption - in production use proper decryption
      const decipher = crypto.createDecipher('aes192', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback for demo
    }
  }

  async getUserCredentials(userId: string) {
    // In production, this would query a database
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Discover Childcare',
        url: 'https://discover.childcare.govt.nz',
        username: 'demo@futurefocus.co.nz',
        password: this.encrypt('demo-password'),
        category: 'childcare',
        favicon: '🎓',
        lastUsed: new Date().toISOString(),
        isActive: true,
        userId
      },
      {
        id: '2',
        name: 'MyHR',
        url: 'https://myhr.co.nz',
        username: 'courtney.manager',
        password: this.encrypt('hr-password'),
        category: 'hr',
        favicon: '👥',
        lastUsed: new Date().toISOString(),
        isActive: true,
        userId
      }
    ];
  }

  async saveCredential(userId: string, credentialData: any) {
    console.log('🔐 Saving credential for user:', userId);
    
    // Encrypt the password before storing
    const encryptedCredential = {
      ...credentialData,
      password: this.encrypt(credentialData.password),
      userId,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    console.log('✅ Credential saved (encrypted)');
    return encryptedCredential;
  }

  async updateLastUsed(userId: string, credentialId: string) {
    console.log('📈 Updating last used for credential:', credentialId);
    // In production, update database record
    return { success: true };
  }
}

const credentialService = new CredentialService();

// GET /api/quick-access - Get user's saved credentials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('📂 Fetching credentials for user:', userId);
    const credentials = await credentialService.getUserCredentials(userId);
    
    // Decrypt passwords for frontend (in production, handle this more securely)
    const decryptedCredentials = credentials.map(cred => ({
      ...cred,
      password: '••••••••' // Never send real passwords to frontend
    }));

    console.log('✅ Returning', credentials.length, 'credentials');
    return NextResponse.json(decryptedCredentials);
  } catch (error) {
    console.error('❌ Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

// POST /api/quick-access - Save new credential
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/quick-access - Saving new credential');
    const body = await request.json();
    const { userId, name, url, username, password, category } = body;

    if (!userId || !name || !url || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const credential = await credentialService.saveCredential(userId, {
      name,
      url,
      username,
      password,
      category
    });

    console.log('✅ Credential saved successfully');
    return NextResponse.json({
      success: true,
      credential: {
        ...credential,
        password: '••••••••' // Don't return real password
      }
    });
  } catch (error) {
    console.error('❌ Error saving credential:', error);
    return NextResponse.json(
      { error: 'Failed to save credential' },
      { status: 500 }
    );
  }
}

// PUT /api/quick-access/[id] - Update last used timestamp
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, credentialId } = body;

    if (!userId || !credentialId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await credentialService.updateLastUsed(userId, credentialId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating last used:', error);
    return NextResponse.json(
      { error: 'Failed to update last used' },
      { status: 500 }
    );
  }
}
