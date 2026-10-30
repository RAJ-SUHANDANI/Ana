import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="workspace-kicker">ANA / 404</span>
      <h1>This space doesn't exist.</h1>
      <p>The page may have moved, or the address may be incorrect.</p>
      <Link className="button button-primary" href="/"><ArrowLeft size={15} /> Return to ANA</Link>
    </main>
  );
}
