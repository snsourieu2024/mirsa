import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role credentials')
  return createClient(url, key)
}

interface PhotoItem {
  name: string
  url: string
}

interface PhotoListResponse {
  photos: PhotoItem[]
  error?: string
}

interface PhotoUploadResponse {
  ok: boolean
  photo?: PhotoItem
  error?: string
}

interface PhotoDeleteResponse {
  ok: boolean
  error?: string
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<PhotoListResponse>> {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    if (!patientId) {
      return NextResponse.json({ photos: [], error: 'Missing patientId' }, { status: 400 })
    }

    const admin = getAdmin()

    const { data, error } = await admin.storage
      .from('photos')
      .list(`${patientId}/`, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (error) throw error

    const photos: PhotoItem[] = (data ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const { data: urlData } = admin.storage
          .from('photos')
          .getPublicUrl(`${patientId}/${f.name}`)
        return { name: f.name, url: urlData.publicUrl }
      })

    return NextResponse.json({ photos })
  } catch (err) {
    return NextResponse.json(
      { photos: [], error: err instanceof Error ? err.message : 'Failed to list photos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PhotoUploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const patientId = formData.get('patientId') as string | null

    if (!file || !patientId) {
      return NextResponse.json(
        { ok: false, error: 'Missing file or patientId' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { ok: false, error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = `${patientId}/${fileName}`

    const admin = getAdmin()
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await admin.storage
      .from('photos')
      .upload(path, buffer, { contentType: file.type })

    if (uploadErr) throw uploadErr

    const { data: urlData } = admin.storage
      .from('photos')
      .getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      photo: { name: fileName, url: urlData.publicUrl },
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<PhotoDeleteResponse>> {
  try {
    const { patientId, fileName } = (await request.json()) as {
      patientId: string
      fileName: string
    }

    if (!patientId || !fileName) {
      return NextResponse.json(
        { ok: false, error: 'Missing patientId or fileName' },
        { status: 400 }
      )
    }

    const admin = getAdmin()

    const { error } = await admin.storage
      .from('photos')
      .remove([`${patientId}/${fileName}`])

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
