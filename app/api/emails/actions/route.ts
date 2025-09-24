import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createGmailClient, validateGmailToken } from '@/lib/gmail'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /emails/actions called')
    
    // Create Supabase client with proper auth handling
    const supabaseAuth = createRouteHandlerClient({ cookies })
    
    // Get session first
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      sessionError: sessionError?.message,
      userId: session?.user?.id 
    })
    
    if (sessionError || !session) {
      console.error('❌ Authentication failed:', sessionError?.message)
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Create a new client with mail schema using the session token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: { schema: 'mail' },
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      }
    )

    // Validate Gmail token
    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token
    
    if (!providerToken || !validateGmailToken(providerToken)) {
      return NextResponse.json({ 
        success: false,
        error: 'Gmail access token required. Please re-authenticate with Google.'
      }, { status: 403 })
    }

    // Create Gmail client
    console.log('🔧 Creating Gmail client with token:', providerToken ? 'present' : 'missing')
    const gmailClient = createGmailClient(providerToken, providerRefreshToken ?? undefined)
    console.log('✅ Gmail client created:', gmailClient ? 'success' : 'failed')

    // Parse request body
    const { actionType, emailIds, emailData } = await request.json()
    console.log('📥 Request data:', { actionType, emailIds, emailData })

    switch (actionType) {
      case 'delete':
        console.log('🗑️ Calling handleDeleteEmails with:', emailIds)
        const deleteResult = await handleDeleteEmails(gmailClient, supabase, emailIds)
        console.log('🗑️ Delete result:', deleteResult)
        return deleteResult
      
      case 'archive':
        return await handleArchiveEmails(gmailClient, supabase, emailIds)
      
      case 'star':
        return await handleStarEmails(gmailClient, supabase, emailIds)
      
      case 'mark_read':
        return await handleMarkAsRead(gmailClient, supabase, emailIds)
      
      case 'send':
        return await handleSendEmail(gmailClient, supabase, emailData, session)
      
      case 'reply':
        return await handleReplyEmail(gmailClient, supabase, emailData)
      
      case 'forward':
        return await handleForwardEmail(gmailClient, supabase, emailData)
      
      case 'restore':
        return await handleRestoreEmails(gmailClient, supabase, emailIds)
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Email action failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleDeleteEmails(gmailClient: any, supabase: any, emailIds: string[]) {
  try {
    console.log('🗑️ Starting delete emails process for:', emailIds)
    const results = []

    for (const emailId of emailIds) {
      console.log('Processing email ID for deletion:', emailId)

      // Get email details from database
      const { data: email, error: emailError } = await supabase
        .from('messages')
        .select('gmail_id, is_in_trash, is_deleted, subject')
        .eq('id', emailId)
        .single()

      console.log('Email data for deletion:', email, 'Error:', emailError)

      if (emailError) {
        console.error('Error fetching email for deletion:', emailError)
        results.push({ emailId, success: false, error: `Database error: ${emailError.message}` })
        continue
      }

      if (email?.gmail_id) {
        console.log('Email found, is_in_trash:', email.is_in_trash)
        
        try {
          // Pour les emails existants, considérer is_in_trash comme false si null/undefined
          const isInTrash = email.is_in_trash === true
          console.log('Raw is_in_trash value:', email.is_in_trash)
          console.log('Final is_in_trash status:', isInTrash)
          
          // Si l'email n'est pas explicitement en corbeille, le mettre en corbeille
          if (!isInTrash) {
            console.log('Email not in trash - moving to trash (soft delete)')
            
            try {
              // Essayer de mettre en corbeille Gmail
              if (gmailClient && gmailClient.users && gmailClient.users.messages) {
                await gmailClient.users.messages.trash({
                  userId: 'me',
                  id: email.gmail_id
                })
                console.log('Successfully moved to Gmail trash')
              } else {
                console.warn('Gmail client not available, skipping Gmail update')
              }
            } catch (gmailError) {
              console.warn('Gmail trash failed, continuing with DB update:', gmailError)
            }

            // Update database - move to trash (soft delete)
            console.log('Updating database for email:', emailId)
            const { error: updateError } = await supabase
              .from('messages')
              .update({ 
                is_in_trash: true, 
                is_deleted: false,  // Pas encore supprimé définitivement
                deleted_at: new Date().toISOString()
              })
              .eq('id', emailId)

            console.log('Database update result:', { updateError })

            if (updateError) {
              console.error('Move to trash error:', updateError)
              results.push({ emailId, success: false, error: `Move to trash failed: ${updateError.message}` })
            } else {
              console.log('Successfully moved email to trash in database')
              results.push({ emailId, success: true, action: 'move_to_trash' })
            }
          } else {
            // Already in trash - permanent delete (hard delete)
            console.log('Email already in trash - performing permanent delete')
            
            try {
              await gmailClient.users.messages.delete({
                userId: 'me',
                id: email.gmail_id
              })
              console.log('Successfully deleted from Gmail')
            } catch (gmailError) {
              console.warn('Gmail delete failed, continuing with DB update:', gmailError)
            }

            // Mark as permanently deleted in database (hard delete)
            const { error: updateError } = await supabase
              .from('messages')
              .update({ 
                is_deleted: true,  // Marqué comme supprimé définitivement
                is_in_trash: true, // Reste en corbeille pour audit
                deleted_at: email.deleted_at || new Date().toISOString() // Garde la date originale
              })
              .eq('id', emailId)

            if (updateError) {
              console.error('Permanent delete error:', updateError)
              results.push({ emailId, success: false, error: `Permanent delete failed: ${updateError.message}` })
            } else {
              console.log('Successfully marked email as permanently deleted')
              results.push({ emailId, success: true, action: 'permanent_delete' })
            }
          }
        } catch (gmailError: any) {
          console.error('Gmail API error during delete:', gmailError)
          results.push({ emailId, success: false, error: `Gmail API error: ${gmailError.message}` })
        }
      } else {
        console.error('Email not found or no Gmail ID for deletion')
        results.push({ emailId, success: false, error: 'Email not found or no Gmail ID' })
      }
    }

    console.log('Delete emails process completed. Results:', results)
    return NextResponse.json({
      success: true,
      message: `Processed ${results.filter(r => r.success).length} emails`,
      results
    })
  } catch (error: any) {
    console.error('Unexpected error in handleDeleteEmails:', error)
    return NextResponse.json({
      success: false,
      error: 'Delete failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleArchiveEmails(gmailClient: any, supabase: any, emailIds: string[]) {
  try {
    const results = []
    
    for (const emailId of emailIds) {
      // Get Gmail ID from database
      const { data: email } = await supabase
        .from('messages')
        .select('gmail_id')
        .eq('id', emailId)
        .single()

      if (email?.gmail_id) {
        // Archive in Gmail (remove INBOX label)
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: email.gmail_id,
          requestBody: {
            removeLabelIds: ['INBOX']
          }
        })

        // Update database
        await supabase
          .from('messages')
          .update({ is_archived: true })
          .eq('id', emailId)

        results.push({ emailId, success: true })
      } else {
        results.push({ emailId, success: false, error: 'Email not found' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Archived ${results.filter(r => r.success).length} emails`,
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Archive failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleStarEmails(gmailClient: any, supabase: any, emailIds: string[]) {
  try {
    const results = []
    
    for (const emailId of emailIds) {
      // Get current starred status
      const { data: email, error: emailError } = await supabase
        .from('messages')
        .select('is_starred')
        .eq('id', emailId)
        .single()

      if (emailError) {
        results.push({ emailId, success: false, error: `Database error: ${emailError.message}` })
        continue
      }

      if (email) {
        const newStarredStatus = !email.is_starred
        
        // Update database only (no Gmail interaction)
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_starred: newStarredStatus })
          .eq('id', emailId)

        if (updateError) {
          results.push({ emailId, success: false, error: `Database update failed: ${updateError.message}` })
        } else {
          results.push({ emailId, success: true, starred: newStarredStatus })
        }
      } else {
        results.push({ emailId, success: false, error: 'Email not found' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated star status for ${results.filter(r => r.success).length} emails`,
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Star update failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleMarkAsRead(gmailClient: any, supabase: any, emailIds: string[]) {
  try {
    const results = []
    
    for (const emailId of emailIds) {
      // Get Gmail ID from database
      const { data: email } = await supabase
        .from('messages')
        .select('gmail_id')
        .eq('id', emailId)
        .single()

      if (email?.gmail_id) {
        // Mark as read in Gmail (remove UNREAD label)
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: email.gmail_id,
          requestBody: {
            removeLabelIds: ['UNREAD']
          }
        })

        // Update database
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', emailId)

        results.push({ emailId, success: true })
      } else {
        results.push({ emailId, success: false, error: 'Email not found' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${results.filter(r => r.success).length} emails as read`,
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Mark as read failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleSendEmail(gmailClient: any, supabase: any, emailData: any, session: any) {
  try {
    console.log('📧 Starting send email process with data:', emailData)
    console.log('🔧 Gmail client in handleSendEmail:', gmailClient ? 'present' : 'undefined')
    const { to, subject, body, cc, bcc, replyTo } = emailData

    // Get user's email from Gmail profile
    console.log('🔍 Getting Gmail profile...')
    const profile = await gmailClient.getProfile()
    const userEmail = profile.data.emailAddress
    console.log('✅ Got user email:', userEmail)

    // Create email message with proper headers
    const message = [
      `From: ${userEmail}`,
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      replyTo ? `In-Reply-To: ${replyTo}` : '',
      replyTo ? `References: ${replyTo}` : '',
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${userEmail.split('@')[1]}>`,
      '',
      body
    ].filter(Boolean).join('\n')

    // Send email via Gmail API
    console.log('📤 Sending email via Gmail API...')
    const response = await gmailClient.sendMessage({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })
    console.log('✅ Email sent successfully, Gmail ID:', response.data.id)

    // Get the sent message details from Gmail to sync properly
    const sentMessage = await gmailClient.getMessage({
      userId: 'me',
      id: response.data.id,
      format: 'full'
    })

    // Store sent email in database with proper thread handling
    console.log('💾 Saving email to database...')
    const { data: sentEmail, error: dbError } = await supabase
      .from('messages')
      .insert({
        user_id: session.user.id, // Add user_id for RLS
        gmail_id: response.data.id,
        gmail_message_id: response.data.id,
        from_email: userEmail,
        from_name: userEmail, // Could be enhanced with user's display name
        to_emails: [to],
        cc_emails: cc ? [cc] : [],
        bcc_emails: bcc ? [bcc] : [],
        subject,
        body,
        is_sent: true,
        is_read: true, // Sent emails are automatically read
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        reply_to_message_id: replyTo || null
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }
    console.log('✅ Email saved to database:', sentEmail?.id)

    // Add SENT label to the message
    await supabase
      .from('message_labels')
      .insert({
        message_id: sentEmail.id,
        label_id: (await supabase
          .from('labels')
          .select('id')
          .eq('name', 'SENT')
          .eq('user_id', sentEmail.user_id)
          .single()).data?.id
      })

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: sentEmail?.id,
      gmailId: response.data.id
    })
  } catch (error: any) {
    console.error('💥 Send email error:', error)
    return NextResponse.json({
      success: false,
      error: 'Send email failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleReplyEmail(gmailClient: any, supabase: any, emailData: any) {
  try {
    const { to, subject, body, originalEmailId } = emailData

    // Get original email details
    const { data: originalEmail } = await supabase
      .from('messages')
      .select('gmail_id, subject, from_email, thread_id')
      .eq('id', originalEmailId)
      .single()

    if (!originalEmail) {
      return NextResponse.json({
        success: false,
        error: 'Original email not found'
      }, { status: 404 })
    }

    // Get user's email from Gmail profile
    const profile = await gmailClient.users.getProfile({ userId: 'me' })
    const userEmail = profile.data.emailAddress

    // Create reply subject
    const replySubject = originalEmail.subject.startsWith('Re: ') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`

    // Create reply message with proper headers
    const message = [
      `From: ${userEmail}`,
      `To: ${originalEmail.from_email}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: <${originalEmail.gmail_id}>`,
      `References: <${originalEmail.gmail_id}>`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${userEmail.split('@')[1]}>`,
      '',
      body
    ].join('\n')

    // Send reply via Gmail API
    const response = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })

    // Store reply in database
    const { data: replyEmail } = await supabase
      .from('messages')
      .insert({
        thread_id: originalEmail.thread_id, // Same thread as original
        gmail_id: response.data.id,
        gmail_message_id: response.data.id,
        from_email: userEmail,
        from_name: userEmail,
        to_emails: [originalEmail.from_email],
        subject: replySubject,
        body,
        is_sent: true,
        is_read: true,
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        reply_to_message_id: originalEmailId
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      emailId: replyEmail?.id,
      gmailId: response.data.id
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Reply failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleForwardEmail(gmailClient: any, supabase: any, emailData: any) {
  try {
    const { to, subject, body, originalEmailId } = emailData

    // Get original email details
    const { data: originalEmail } = await supabase
      .from('messages')
      .select('gmail_id, subject, body, from_email, from_name')
      .eq('id', originalEmailId)
      .single()

    if (!originalEmail) {
      return NextResponse.json({
        success: false,
        error: 'Original email not found'
      }, { status: 404 })
    }

    // Get user's email from Gmail profile
    const profile = await gmailClient.users.getProfile({ userId: 'me' })
    const userEmail = profile.data.emailAddress

    // Create forward subject
    const forwardSubject = originalEmail.subject.startsWith('Fwd: ') 
      ? originalEmail.subject 
      : `Fwd: ${originalEmail.subject}`

    // Create forward message
    const forwardedBody = `---------- Forwarded message ---------
From: ${originalEmail.from_name || originalEmail.from_email}
Date: ${new Date().toLocaleDateString()}
Subject: ${originalEmail.subject}
To: ${userEmail}

${originalEmail.body}

---------- Forwarded message ---------

${body}`

    const message = [
      `From: ${userEmail}`,
      `To: ${to}`,
      `Subject: ${forwardSubject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${userEmail.split('@')[1]}>`,
      '',
      forwardedBody
    ].join('\n')

    // Send forward via Gmail API
    const response = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })

    // Store forward in database
    const { data: forwardEmail } = await supabase
      .from('messages')
      .insert({
        gmail_id: response.data.id,
        gmail_message_id: response.data.id,
        from_email: userEmail,
        from_name: userEmail,
        to_emails: [to],
        subject: forwardSubject,
        body: forwardedBody,
        is_sent: true,
        is_read: true,
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        forwarded_from_message_id: originalEmailId
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: 'Email forwarded successfully',
      emailId: forwardEmail?.id,
      gmailId: response.data.id
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Forward failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleRestoreEmails(gmailClient: any, supabase: any, emailIds: string[]) {
  try {
    const results = []
    
    for (const emailId of emailIds) {
      // Get email details from database
      const { data: email, error: emailError } = await supabase
        .from('messages')
        .select('is_in_trash')
        .eq('id', emailId)
        .single()

      if (emailError) {
        results.push({ emailId, success: false, error: `Database error: ${emailError.message}` })
        continue
      }

      if (email && email.is_in_trash) {
        // Update database only (no Gmail interaction)
        const { error: updateError } = await supabase
          .from('messages')
          .update({ 
            is_in_trash: false, 
            is_deleted: false,
            deleted_at: null
          })
          .eq('id', emailId)

        if (updateError) {
          results.push({ emailId, success: false, error: `Database update failed: ${updateError.message}` })
        } else {
          results.push({ emailId, success: true })
        }
      } else {
        results.push({ emailId, success: false, error: 'Email not found or not in trash' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Restored ${results.filter(r => r.success).length} emails`,
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Restore failed',
      details: error.message
    }, { status: 500 })
  }
}
