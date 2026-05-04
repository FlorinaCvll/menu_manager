import { Globe, Mail, MessageCircleMore, Phone, Share2 } from "lucide-react";
import Marca from "@/components/shared/Marca";

const TELEFONO_CONTACTO = "920 123 456";
const TELEFONO_CONTACTO_ENLACE = "tel:+34920123456";
const EMAIL_CONTACTO = "contacto@menumanager.es";
const EMAIL_CONTACTO_ENLACE = "mailto:contacto@menumanager.es";

const redesSociales = [
  { label: "Instagram", icon: Share2 },
  { label: "Facebook", icon: Globe },
  { label: "WhatsApp", icon: MessageCircleMore },
];

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-[var(--line)] bg-[#211d38] px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-start">
        <div>
          <Marca compacta />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-slate-100/60">
            Contacto
          </p>
          <a
            href={TELEFONO_CONTACTO_ENLACE}
            className="flex items-center gap-2 text-sm font-semibold text-white/92"
          >
            <Phone className="h-4 w-4" />
            {TELEFONO_CONTACTO}
          </a>
          <a
            href={EMAIL_CONTACTO_ENLACE}
            className="flex items-center gap-2 text-sm font-semibold text-white/92"
          >
            <Mail className="h-4 w-4" />
            {EMAIL_CONTACTO}
          </a>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-slate-100/60">
            Redes
          </p>
          <div className="flex flex-wrap gap-2">
            {redesSociales.map((red) => (
              <span
                key={red.label}
                className="inline-flex items-center gap-2 rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-50/92"
              >
                <red.icon className="h-4 w-4" />
                {red.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
