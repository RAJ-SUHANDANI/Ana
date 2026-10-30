"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("ANA application error:", error);
  }, [error]);

  return (
    <main className="not-found">
      <span className="workspace-kicker">ANA / SOMETHING WENT WRONG</span>
      <h1>Let's find our way back.</h1>
      <p>Something interrupted this page. You can try again or return to ANA's home.</p>
      <div className="error-actions">
        <button className="button button-primary" onClick={reset}><RefreshCw size={15} /> Try again</button>
        <Link className="text-link" href="/">Return home <ArrowLeftFallback /></Link>
      </div>
    </main>
  );
}

function ArrowLeftFallback() {
  return <span aria-hidden="true">↗</span>;
}
