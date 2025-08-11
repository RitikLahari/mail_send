# Secure Mail - Next.js 14 Application

A secure, encrypted mail-sending application built with Next.js 14, featuring Google OAuth authentication, end-to-end encryption, and Redis storage.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 🛡️ **End-to-End Encryption** - Custom encryption for text and images
- 📧 **Secure Email Delivery** - Encrypted messages with 24-hour expiration
- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- 🚀 **Redis Storage** - Fast, scalable message storage
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Session Management** - Secure user sessions with NextAuth.js

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Backend**: Next.js API Routes
- **Database**: Redis (Cloud instance)
- **Email**: Nodemailer
- **Encryption**: Custom encryption algorithms
- **Icons**: React Icons (Feather icons)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account (for OAuth)
- Redis Cloud account
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd mail-send-app
npm install
```

### 2. Environment Configuration

Copy the environment file and configure your settings:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Redis Configuration
REDIS_URL=redis://default:your-password@your-redis-host:port

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# NextAuth Configuration
NEXTAUTH_SECRET=your-very-long-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

### 4. Redis Setup

1. Sign up for [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection URL to your `.env.local`
4. The connection URL format: `redis://default:password@host:port`

### 5. SMTP Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

For other providers, adjust the SMTP settings accordingly.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🔐 Authentication Flow

1. **Sign In**: Users click "Continue with Google" button
2. **OAuth Redirect**: Redirected to Google for authentication
3. **Callback**: Google redirects back with authorization code
4. **Session Creation**: NextAuth creates a secure session
5. **User Storage**: User data stored in Redis for 30 days
6. **Protected Routes**: All main features require authentication

## 📧 Message Flow

1. **Compose**: Authenticated user creates message with recipient email
2. **Encryption**: Text and image encrypted using custom algorithms
3. **Storage**: Encrypted data stored in Redis with 24-hour expiry
4. **Email**: Recipient receives email with secure link
5. **Decryption**: Recipient clicks link to decrypt and view message
6. **Expiration**: Message automatically deleted after 24 hours

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js    # NextAuth configuration
│   │   ├── send/route.js                  # Send message API
│   │   └── view/[id]/route.js            # View message API
│   ├── auth/
│   │   ├── signin/page.js                 # Sign in page
│   │   └── error/page.js                  # Auth error page
│   ├── view/[id]/page.js                 # Message view page
│   ├── layout.js                          # Root layout
│   ├── page.js                            # Home page
│   └── providers.js                       # Session provider
├── lib/
│   ├── redis.js                           # Redis client
│   └── encryption.js                      # Encryption functions
└── globals.css                            # Global styles
```

## 🔒 Security Features

- **OAuth 2.0**: Secure Google authentication
- **JWT Sessions**: Stateless session management
- **End-to-End Encryption**: Custom encryption algorithms
- **Redis Security**: Secure Redis connection with authentication
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: Built-in Next.js protection
- **HTTPS Only**: Production security requirements

## 🎨 UI Components

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Mobile-first approach
- **Gradient Backgrounds**: Beautiful visual elements
- **Interactive Elements**: Hover effects and animations
- **Icon Integration**: Consistent iconography
- **Toast Notifications**: User feedback system

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Adaptive layouts for medium screens
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Optimized for touch devices

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify**: Similar to Vercel
- **Railway**: Good for full-stack apps
- **DigitalOcean**: VPS deployment
- **AWS**: Enterprise deployment

## 🔧 Customization

### Styling
- Modify `tailwind.config.js` for theme changes
- Edit `globals.css` for custom styles
- Update component classes for layout changes

### Encryption
- Modify `src/lib/encryption.js` for custom algorithms
- Implement your own encryption methods
- Add additional security layers

### Features
- Add user management features
- Implement message templates
- Add file type restrictions
- Create admin dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Check Redis URL format
   - Verify Redis instance is running
   - Check firewall settings

2. **Google OAuth Error**
   - Verify Client ID and Secret
   - Check redirect URIs
   - Ensure Google+ API is enabled

3. **SMTP Error**
   - Verify SMTP credentials
   - Check port and security settings
   - Test with different email provider

4. **Build Errors**
   - Clear `.next` folder
   - Update Node.js version
   - Check dependency conflicts

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=next-auth:*
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: support@example.com
- Documentation: [Wiki Link]

## 🔮 Future Enhancements

- [ ] Multi-factor authentication
- [ ] Message templates
- [ ] User management dashboard
- [ ] Advanced encryption options
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Analytics dashboard
- [ ] Multi-language support

---

**Built with ❤️ using Next.js 14 and modern web technologies**
