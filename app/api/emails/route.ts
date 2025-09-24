import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with proper auth handling
    const supabaseAuth = createRouteHandlerClient({ cookies })
    
    // Get session first
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
    const offset = parseInt(searchParams.get('offset') || '0')
    const folder = searchParams.get('folder') || 'all'

    // Build base query - RLS policies handle user authorization automatically
    let query = supabase
      .from('messages')
      .select(`
        id,
        subject,
        from_email,
        from_name,
        to_emails,
        cc_emails,
        body,
        body_html,
        is_read,
        is_starred,
        is_important,
        is_sent,
        sent_at,
        received_at
      `)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply folder filter
    switch (folder) {
      case 'inbox':
        query = query.eq('is_sent', false)
        break
      case 'sent':
        query = query.eq('is_sent', true)
        break
      case 'starred':
        query = query.eq('is_starred', true)
        break
      case 'important':
        query = query.eq('is_important', true)
        break
      case 'unread':
        query = query.eq('is_read', false)
        break
    }

    const { data: emails, error: emailsError } = await query

    if (emailsError) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch emails',
        details: emailsError.message 
      }, { status: 500 })
    }

    // Get total count for pagination
    // RLS policies handle user authorization automatically
    let countQuery = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    // Apply same folder filter for count
    switch (folder) {
      case 'inbox':
        countQuery = countQuery.eq('is_sent', false)
        break
      case 'sent':
        countQuery = countQuery.eq('is_sent', true)
        break
      case 'starred':
        countQuery = countQuery.eq('is_starred', true)
        break
      case 'important':
        countQuery = countQuery.eq('is_important', true)
        break
      case 'unread':
        countQuery = countQuery.eq('is_read', false)
        break
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get email count',
        details: countError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emails: emails || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch emails',
      details: error.message
    }, { status: 500 })
  }
}