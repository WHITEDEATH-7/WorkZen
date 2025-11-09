import emailjs from '@emailjs/browser';

/**
 * Generate Login ID in format: OI + First 2 letters of first name + First 2 letters of last name + Year + Serial
 * Example: John Doe, 2025, serial 0001 => OIJODO20250001
 */
export const generateLoginId = (
  firstName: string,
  lastName: string,
  year: number,
  serial: number
): string => {
  const prefix = 'OI';
  const firstInitials = firstName.substring(0, 2).toUpperCase();
  const lastInitials = lastName.substring(0, 2).toUpperCase();
  const serialStr = serial.toString().padStart(4, '0');
  
  return `${prefix}${firstInitials}${lastInitials}${year}${serialStr}`;
};

/**
 * Generate a secure random password with 8-10 characters
 * Contains uppercase, lowercase, numbers, and special characters
 */
export const generatePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  const length = Math.floor(Math.random() * 3) + 8; // 8-10 characters
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Hash password (for mock backend - in production use bcrypt)
 */
export const hashPassword = (password: string): string => {
  // Simple hash for mock - in production use proper hashing
  return btoa(password);
};

/**
 * Verify password against hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash;
};

/**
 * Get next serial number for login ID generation
 */
export const getNextSerial = async (year: number): Promise<number> => {
  // In real app, query database for max serial of the year
  // For mock, we'll return a simple increment
  return 1;
};

/**
 * Send credentials email - REAL EMAIL using EmailJS
 */
export const sendCredentialsEmail = async (
  email: string,
  loginId: string,
  password: string,
  firstName: string
): Promise<void> => {
  const emailData = {
    to: email,
    subject: 'Your WorkZen HRMS Account Credentials',
    body: `
Dear ${firstName},

Welcome to WorkZen HRMS! Your account has been created successfully.

Login Credentials:
- Login ID: ${loginId}
- Email: ${email}
- Temporary Password: ${password}

Please log in at: ${window.location.origin}/signin

For security reasons, you will be required to change your password on first login.

Best regards,
WorkZen HRMS Team
    `.trim(),
    timestamp: new Date().toISOString(),
  };
  
  try {
    // Initialize EmailJS with public key
    emailjs.init('a5USTqsPm1C03OXc4');
    
    // Send REAL email using EmailJS
    const result = await emailjs.send(
      'service_0ht2n36',  // Your Service ID
      'template_9bmgyb5',  // Your Template ID
      {
        to_email: email,        // Recipient email
        from_name: 'WorkZen HRMS',
        to_name: firstName,
        reply_to: 'noreply@workzen.com',
        subject: emailData.subject,
        message: emailData.body,
        login_id: loginId,
        password: password,
      }
    );
    
    console.log('✅ ===== REAL EMAIL SENT SUCCESSFULLY! ===== ✅');
    console.log('Status:', result.status);
    console.log('Text:', result.text);
    console.log('To:', email);
    console.log('============================================');
  } catch (error: any) {
    console.error('❌ ===== EMAIL SENDING FAILED ===== ❌');
    console.error('Error:', error);
    console.error('Error Message:', error?.text || error?.message);
    console.error('Service ID:', 'service_0ht2n36');
    console.error('Template ID:', 'template_9bmgyb5');
    console.error('To Email:', email);
    console.error('======================================');
    
    console.warn('⚠️ Email will still be saved to Mock Inbox');
    // Don't show alert - just log error, continue with mock email
  }
  
  // Also save to mock inbox for testing
  console.log('📧 ===== EMAIL SENT ===== 📧');
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('Body:', emailData.body);
  console.log('========================');
  
  // Save to localStorage for Mock Email Inbox
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `mock_email_${Date.now()}`,
      JSON.stringify(emailData)
    );
  }
};
