'use client'

import React, { useMemo, useState } from 'react'
import type { TextFieldClientComponent } from 'payload'

const previewStyle: React.CSSProperties = {
  marginTop: 12,
  width: 320,
  maxWidth: '100%',
  aspectRatio: '16 / 9',
  objectFit: 'cover',
  borderRadius: 12,
  border: '1px solid var(--theme-elevation-150)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 10,
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: '10px 12px',
  background: 'var(--theme-input-bg)',
  color: 'var(--theme-text)',
}

const helpStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: 'var(--theme-text)',
  opacity: 0.72,
}

const errorStyle: React.CSSProperties = {
  ...helpStyle,
  color: 'var(--theme-error-500)',
  opacity: 1,
}

const buttonStyle: React.CSSProperties = {
  marginTop: 10,
}

const hiddenInputStyle: React.CSSProperties = {
  display: 'none',
}

const sanitizeFolder = 'udemy-courses'

const UdemyThumbnailField: TextFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly } = props
  const initialValue = useMemo(() => {
    const nextValue = (props as { value?: unknown })?.value
    return typeof nextValue === 'string' ? nextValue : ''
  }, [props])
  const [value, setValue] = useState(initialValue)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const path = pathFromProps || field.name || 'thumbnail'
  const inputId = `field-${path.replace(/[^a-zA-Z0-9_-]/g, '-')}`
  const label = typeof field.label === 'string' ? field.label : 'Thumbnail'
  const description = typeof field.admin?.description === 'string' ? field.admin.description : ''

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', sanitizeFolder)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(json?.message || 'Upload failed')
      }

      setValue(typeof json?.url === 'string' ? json.url : '')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="field-type text">
      <label htmlFor={inputId} style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
        {label}
        {field.required ? ' *' : ''}
      </label>

      <label className="btn" style={{ ...buttonStyle, opacity: readOnly ? 0.6 : 1, pointerEvents: readOnly ? 'none' : 'auto' }}>
        {uploading ? 'Uploading...' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={readOnly || uploading}
          style={hiddenInputStyle}
        />
      </label>

      <input
        type="hidden"
        name={path}
        value={value}
        readOnly
      />

      <input
        id={inputId}
        name={path}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        readOnly={readOnly}
        placeholder="Upload to S3 or paste an image URL"
        style={inputStyle}
      />

      {description ? <div style={helpStyle}>{description}</div> : null}
      {error ? <div style={errorStyle}>{error}</div> : null}

      {value ? (
        <img
          src={value}
          alt="Udemy thumbnail preview"
          style={previewStyle}
        />
      ) : null}
    </div>
  )
}

export default UdemyThumbnailField
