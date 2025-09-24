# Email AI Platform - Gmail Integration

## 🏗️ Project Structure

### Core Libraries
- **`/lib/supabaseClient.ts`** - Supabase authentication and client setup
- **`/lib/gmail.ts`** - Gmail API client wrapper with TypeScript interfaces
- **`/lib/emailParser.ts`** - Converts Gmail API responses to database schema format

### API Endpoints
- **`/api/gmail/sync`** - Syncs emails from Gmail to Supabase database
- **`/api/emails`** - Fetches synced emails from database with pagination

### Pages
- **`/dashboard`** - Main dashboard (simplified, no test UI)
- **`/emails`** - Email list page showing synced emails from database

### Database Schema
The system uses the `mail` schema with the following tables:
- `mail.threads` - Email conversation threads
- `mail.messages` - Individual email messages
- `mail.labels` - Email labels (system and custom)
- `mail.message_labels` - Many-to-many relationship between messages and labels
- `mail.attachments` - Email attachments
- `mail.ai_agents` - AI agent configurations
- `mail.agent_actions` - Actions performed by AI agents
- `mail.user_settings` - User preferences

## 🔄 Gmail Sync Process

1. **Authentication**: User logs in with Google OAuth (includes Gmail scopes)
2. **Sync Trigger**: User clicks "Synchroniser avec Gmail" on `/emails` page
3. **API Call**: `POST /api/gmail/sync` fetches latest 20 emails from Gmail
4. **Parsing**: Each email is parsed using `EmailParser` class
5. **Database Storage**: Emails are stored with proper relationships:
   - Thread → Messages → Labels → Attachments
6. **UI Update**: Email list refreshes to show synced emails

## 🔧 Key Features

### Gmail API Integration
- ✅ OAuth2 authentication with Gmail scopes
- ✅ Fetches emails, threads, and attachments
- ✅ Handles multi-part email bodies (HTML + text)
- ✅ Extracts email metadata (from, to, cc, bcc, dates)

### Database Integration
- ✅ Proper foreign key relationships
- ✅ Upsert operations to handle duplicates
- ✅ Label synchronization
- ✅ Attachment metadata storage

### Error Handling
- ✅ 401 for no active session
- ✅ 403 for missing Gmail provider_token
- ✅ 500 for Gmail API failures
- ✅ Graceful handling of parsing errors

### UI/UX
- ✅ Clean email list with read/unread indicators
- ✅ Sync status feedback
- ✅ Error message display
- ✅ Responsive design

## 🚀 Usage

1. **Login**: User authenticates with Google (Gmail scopes included)
2. **Navigate**: Go to `/emails` page
3. **Sync**: Click "Synchroniser avec Gmail" button
4. **View**: Browse synced emails with full metadata

## 📋 Gmail Scopes Required

The system requests these Gmail scopes:
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.modify` - Modify email labels
- `https://www.googleapis.com/auth/gmail.send` - Send emails

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own emails
- Provider tokens are handled securely by Supabase
- No sensitive data stored in client-side code
