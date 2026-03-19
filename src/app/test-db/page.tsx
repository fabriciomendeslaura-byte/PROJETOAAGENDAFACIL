"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestPage() {
  const [results, setResults] = useState<any[]>([]);

  const testInsert = async () => {
    const supabase = createClient();
    const newResults = [];

    // Test 1: Try to insert into companies with minimal data
    const { error: error1 } = await supabase.from("companies").insert([{ name: "Test Co" }]);
    newResults.push({ test: "Companies (name only)", error: error1?.message, detail: error1?.details });

    // Test 2: Try to insert into companies with name and slug
    const { error: error2 } = await supabase.from("companies").insert([{ name: "Test Co 2", slug: "test-co-2" }]);
    newResults.push({ test: "Companies (name + slug)", error: error2?.message, detail: error2?.details });

    // Test 3: Try to insert into users
    const { error: error3 } = await supabase.from("users").insert([{ id: "00000000-0000-0000-0000-000000000000", name: "Test User" }]);
    newResults.push({ test: "Users (id + name)", error: error3?.message, detail: error3?.details });

    setResults(newResults);
  };

  return (
    <div className="p-8">
      <button onClick={testInsert} className="bg-blue-500 text-white px-4 py-2 rounded">Run Tests</button>
      <div className="mt-4 space-y-4">
        {results.map((r, i) => (
          <div key={i} className="p-4 border rounded">
            <p><strong>{r.test}</strong></p>
            <p className="text-red-500">Error: {r.error || "None"}</p>
            <p className="text-slate-500 text-sm">Detail: {r.detail || "None"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
