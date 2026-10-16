import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = { title: "Busca" };

export default function Page() {
  return (
    <div className="wrap listing">
      <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
