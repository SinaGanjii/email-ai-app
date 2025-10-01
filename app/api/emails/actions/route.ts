import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createGmailClient, validateGmailToken } from '@/lib/gmail'

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies })
    
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 })
    }

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

    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token
    
    if (!providerToken || !validateGmailToken(providerToken)) {
      return NextResponse.json({ 
        success: false,
        error: 'Gmail access token required. Please re-authenticate with Google.'
      }, { status: 403 })
    }

    const gmailClient = createGmailClient(providerToken, providerRefreshToken ?? undefined)
    const { actionType, emailIds, emailData } = await request.json()

    switch (actionType) {
      case 'delete':
        return await handleDeleteEmails(gmailClient, supabase, emailIds)
      
      case 'archive':
        return await handleArchiveEmails(gmailClient, supabase, emailIds)
      
      case 'star':
        return await handleStarEmails(gmailClient, supabase, emailIds)
      
      case 'toggleImportant':
        return await handleToggleImportant(supabase, emailIds)
      
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
    const results = []

    for (const emailId of emailIds) {

      const { data: email, error: emailError } = await supabase
        .from('messages')
        .select('gmail_id, is_in_trash, is_deleted, subject')
        .eq('id', emailId)
        .single()


      if (emailError) {
        console.error('Error fetching email for deletion:', emailError)
        results.push({ emailId, success: false, error: `Database error: ${emailError.message}` })
        continue
      }

      if (email?.gmail_id) {
        
        try {
          const isInTrash = email.is_in_trash === true
          
          if (!isInTrash) {
            
            try {
              if (gmailClient && gmailClient.users && gmailClient.users.messages) {
                await gmailClient.users.messages.trash({
                  userId: 'me',
                  id: email.gmail_id
                })
              } else {
                console.warn('Gmail client not available, skipping Gmail update')
              }
            } catch (gmailError) {
              console.warn('Gmail trash failed, continuing with DB update:', gmailError)
            }

            const { error: updateError } = await supabase
              .from('messages')
              .update({ 
                is_in_trash: true, 
                is_deleted: false,  
                deleted_at: new Date().toISOString()
              })
              .eq('id', emailId)


            if (updateError) {
              console.error('Move to trash error:', updateError)
              results.push({ emailId, success: false, error: `Move to trash failed: ${updateError.message}` })
            } else {
              results.push({ emailId, success: true, action: 'move_to_trash' })
            }
          } else {
            
            try {
              await gmailClient.users.messages.delete({
                userId: 'me',
                id: email.gmail_id
              })
            } catch (gmailError) {
              console.warn('Gmail delete failed, continuing with DB update:', gmailError)
            }

            const { error: updateError } = await supabase
              .from('messages')
              .update({ 
                is_deleted: true,  
                is_in_trash: true, 
                deleted_at: email.deleted_at || new Date().toISOString()
              })
              .eq('id', emailId)

            if (updateError) {
              console.error('Permanent delete error:', updateError)
              results.push({ emailId, success: false, error: `Permanent delete failed: ${updateError.message}` })
            } else {
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
      const { data: email } = await supabase
        .from('messages')
        .select('gmail_id')
        .eq('id', emailId)
        .single()

      if (email?.gmail_id) {
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: email.gmail_id,
          requestBody: {
            removeLabelIds: ['INBOX']
          }
        })

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
      const { data: email } = await supabase
        .from('messages')
        .select('gmail_id')
        .eq('id', emailId)
        .single()

      if (email?.gmail_id) {
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: email.gmail_id,
          requestBody: {
            removeLabelIds: ['UNREAD']
          }
        })

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

async function handleToggleImportant(supabase: any, emailIds: string[]) {
  try {
    const results = []
    
    for (const emailId of emailIds) {
      const { data: email } = await supabase
        .from('messages')
        .select('is_important')
        .eq('id', emailId)
        .single()

      if (email) {
        const newImportantStatus = !email.is_important
        
        await supabase
          .from('messages')
          .update({ is_important: newImportantStatus })
          .eq('id', emailId)

        results.push({ 
          emailId, 
          success: true, 
          is_important: newImportantStatus 
        })
      } else {
        results.push({ emailId, success: false, error: 'Email not found' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Toggled important status for ${results.filter(r => r.success).length} emails`,
      results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Toggle important failed',
      details: error.message
    }, { status: 500 })
  }
}

async function handleSendEmail(gmailClient: any, supabase: any, emailData: any, session: any) {
  try {
    const { to, subject, body, cc, bcc, replyTo } = emailData

    const profile = await gmailClient.getProfile()
    const userEmail = profile.data.emailAddress

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

    const response = await gmailClient.sendMessage({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })

    const sentMessage = await gmailClient.getMessage({
      userId: 'me',
      id: response.data.id,
      format: 'full'
    })

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
      throw new Error(`Database error: ${dbError.message}`)
    }

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

    const profile = await gmailClient.users.getProfile({ userId: 'me' })
    const userEmail = profile.data.emailAddress

    const replySubject = originalEmail.subject.startsWith('Re: ') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`

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

    const response = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })

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

    const profile = await gmailClient.users.getProfile({ userId: 'me' })
    const userEmail = profile.data.emailAddress

    const forwardSubject = originalEmail.subject.startsWith('Fwd: ') 
      ? originalEmail.subject 
      : `Fwd: ${originalEmail.subject}`

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

    const response = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
    })

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
