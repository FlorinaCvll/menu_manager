import Link from "next/link";

export default function AltaCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
      <section className="paper-panel p-8">
        <p className="paper-tag">Pago no completado</p>
        <h1 className="section-title mt-4 text-4xl font-semibold text-stone-900">
          La solicitud queda pendiente de pago
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Hemos conservado la solicitud, pero el servicio no podrá activarse hasta
          que el pago esté confirmado y la documentación haya sido validada.
        </p>
        <Link href="/#compra" className="primary-button mt-6">
          Volver al formulario
        </Link>
      </section>
    </main>
  );
}
