'use client';

import { useEffect, useRef } from 'react';

export default function VisitorNotifier() {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (hasNotified.current) return;
    hasNotified.current = true;

    // Fire and forget
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'Stackview Page Visitor',
        details: 'A visitor accessed your Stackview site.',
        scenario: 'Page Visit Alert',
        result: 'Success',
      }),
    }).catch(console.error);
  }, []);

  return null;
}
