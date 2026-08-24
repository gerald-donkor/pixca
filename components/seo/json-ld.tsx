import * as React from "react"

export interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>
}

/**
 * Server component rendering Schema.org structured data in application/ld+json scripts.
 * Uses safe JSON escaping to prevent XSS.
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  )
}
