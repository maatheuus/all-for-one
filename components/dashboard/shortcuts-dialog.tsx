"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Busca rápida" },
  { keys: ["/"], label: "Busca rápida" },
  { keys: ["N"], label: "Novo link" },
  { keys: ["1–9"], label: "Abrir link fixado" },
  { keys: ["F"], label: "Iniciar foco" },
  { keys: ["T"], label: "Alternar tema" },
  { keys: ["⌘", "V"], label: "Colar URL para adicionar" },
  { keys: ["?"], label: "Mostrar atalhos" },
]

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Atalhos</DialogTitle>
          <DialogDescription>Navegue sem tirar as mãos do teclado.</DialogDescription>
        </DialogHeader>
        <ul className="grid divide-y">
          {shortcuts.map((s) => (
            <li key={s.label + s.keys.join()} className="flex items-center justify-between py-2.5 text-sm">
              {s.label}
              <KbdGroup>
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </KbdGroup>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
