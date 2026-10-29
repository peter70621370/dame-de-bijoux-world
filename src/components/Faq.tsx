import type { FaqItem } from "@/lib/faq";
import { IconPlus } from "./icons";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-filet border-y border-filet">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-serif text-[1.45rem] leading-snug transition-colors hover:text-or-fonce md:text-2xl">
            {item.q}
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-filet transition-transform duration-300 group-open:rotate-45">
              <IconPlus width={16} height={16} />
            </span>
          </summary>
          <p className="max-w-2xl pb-7 text-[0.95rem] leading-relaxed text-douce">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
