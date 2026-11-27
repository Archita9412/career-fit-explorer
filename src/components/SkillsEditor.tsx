import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...skills];
    for (const p of parts) if (!next.some((s) => s.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next);
    setV("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <Input value={v} placeholder="e.g. React, SQL" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add}><Plus /> Add</Button>
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(skills.filter((x) => x !== s))}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
