import Image from "next/image";
import Link from "next/link";

type PropiedadesMarca = {
  compacta?: boolean;
  href?: string;
};

export default function Marca({
  compacta = false,
  href = "/",
                              }: PropiedadesMarca)
{
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <span className="glass-card-strong flex h-11 w-11 items-center justify-center rounded-[0.9rem] border border-white/10">
        <Image
            src="/colibri.jpg"
          alt="Icono de MenuManager"
          width={28}
          height={28}
          priority
        />
      </span>
      {!compacta ? (
        <span className="flex flex-col">
          <span className="text-[1.1rem] font-semibold tracking-[-0.03em] text-white">
            MenuManager
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-100/68">
            Gestion diaria de restaurantes
          </span>
        </span>
      ) : null}
    </Link>
  );
}
