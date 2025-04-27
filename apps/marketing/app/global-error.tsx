"use client"

import * as React from 'react';
import NextError from 'next/error';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error: { digest, ...error }
}: GlobalErrorProps) {
  return (
    <html>
      <body>
        <NextError statusCode={undefined as never} />
      </body>
    </html>
  )
}