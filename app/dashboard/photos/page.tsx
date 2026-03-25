'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

interface UploadedPhoto {
  name: string
  url: string
}

export default function DashboardPhotos() {
  const { patient } = useAuth()
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadPhotos = useCallback(async () => {
    if (!patient) return
    try {
      const res = await fetch(`/api/photos?patientId=${patient.id}`)
      const data = (await res.json()) as { photos: UploadedPhoto[]; error?: string }

      if (data.error) throw new Error(data.error)
      setPhotos(data.photos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load photos.')
    } finally {
      setLoading(false)
    }
  }, [patient])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !patient) return
    setError('')
    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue

        const formData = new FormData()
        formData.append('file', file)
        formData.append('patientId', patient.id)

        const res = await fetch('/api/photos', { method: 'POST', body: formData })
        const data = (await res.json()) as { ok: boolean; photo?: UploadedPhoto; error?: string }

        if (!data.ok) throw new Error(data.error ?? 'Upload failed')

        if (data.photo) {
          setPhotos(prev => [data.photo!, ...prev])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(name: string) {
    if (!patient) return
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, fileName: name }),
      })

      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!data.ok) throw new Error(data.error ?? 'Delete failed')

      setPhotos(prev => prev.filter(p => p.name !== name))
    } catch {
      setError('Failed to delete photo.')
    }
  }

  function copyUrl(url: string) {
    try {
      navigator.clipboard.writeText(url)
      setCopied(url)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard not available
    }
  }

  if (!patient) {
    return (
      <div className="pt-10 text-center">
        <p className="font-sans text-sm text-mirsa-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="pt-8 space-y-6">
      <div>
        <h1 className="font-serif text-xl font-semibold text-mirsa-text mb-1">
          Photos
        </h1>
        <p className="font-sans text-sm text-mirsa-muted">
          Upload photos that appear on {patient.name}&apos;s device display alongside answers.
          You can copy a photo&apos;s URL and paste it when setting up a question.
        </p>
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className={`block w-full text-center font-sans text-sm font-medium rounded-xl px-4 py-4 min-h-[48px] cursor-pointer transition-colors border-2 border-dashed ${
            uploading
              ? 'border-mirsa-teal/30 bg-mirsa-teal/5 text-mirsa-muted cursor-wait'
              : 'border-mirsa-text/15 hover:border-mirsa-teal/40 text-mirsa-teal hover:bg-mirsa-teal/5'
          }`}
        >
          {uploading ? 'Uploading...' : 'Tap to upload photos'}
        </label>
      </div>

      {error && (
        <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="font-sans text-sm text-mirsa-muted">Loading photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white border border-mirsa-text/10 rounded-card p-8 text-center">
          <p className="font-serif text-base text-mirsa-text mb-2">
            No photos yet
          </p>
          <p className="font-sans text-sm text-mirsa-muted">
            Upload familiar photos — the key hook, {patient.name}&apos;s favourite chair,
            family snapshots. These appear on the device display when an answer is spoken.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map(photo => (
            <div key={photo.name} className="relative group">
              <div className="aspect-square rounded-card overflow-hidden bg-mirsa-text/5 border border-mirsa-text/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-card bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center gap-2 p-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(photo.url)}
                  className="font-sans text-[10px] font-medium text-white bg-mirsa-teal/90 rounded-lg px-2.5 py-1.5"
                >
                  {copied === photo.url ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => handleDelete(photo.name)}
                  className="font-sans text-[10px] font-medium text-white bg-red-500/90 rounded-lg px-2.5 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-mirsa-teal/5 border border-mirsa-teal/20 rounded-card p-5">
        <p className="font-sans text-xs font-medium text-mirsa-text mb-1">
          How to use photos with questions
        </p>
        <p className="font-sans text-xs text-mirsa-muted">
          After uploading a photo, hover over it and tap &ldquo;Copy URL&rdquo;.
          Then go to Questions &amp; Answers, edit a question, and paste the URL
          into the photo field. The photo will appear on the device when that answer is spoken.
        </p>
      </div>
    </div>
  )
}
