import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

import { redirectSignedInUserToDashboard } from "@/lib/auth";

export default async function Page() {
  await redirectSignedInUserToDashboard();

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white shadow-sm sm:h-9 sm:w-9 sm:text-sm">
            CL
          </span>
          <span className="hidden text-lg font-bold text-primary min-[375px]:inline">
            CompuLibre
          </span>
        </div>

        <Show when="signed-out">
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold text-primary transition hover:bg-secondary/60 sm:px-4 sm:text-sm"
              >
                Iniciar sesión
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="whitespace-nowrap rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:px-4 sm:text-sm"
              >
                Registrarse
              </button>
            </SignUpButton>
          </div>
        </Show>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 pt-12 text-center sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <p className="text-sm font-semibold uppercase text-highlight">
          Panel para vendedores
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
          Vendé hardware y periféricos en CompuLibre
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
          Gestioná tu catálogo, controlá tu stock y seguí tus ventas desde un
          único dashboard moderno y simple.
        </p>

        <Show when="signed-out">
          <div className="mt-8">
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-highlight/85"
              >
                Empezar a vender
              </button>
            </SignUpButton>
          </div>
        </Show>

        <div className="mt-10 w-full max-w-sm md:hidden">
          <Image
            src="/landing-m.png"
            alt="Vista previa movil del dashboard de vendedores de CompuLibre"
            width={853}
            height={1706}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="mt-16 hidden w-full max-w-6xl md:block lg:mt-20">
          <Image
            src="/landing.png"
            alt="Vista previa del dashboard de vendedores de CompuLibre"
            width={1536}
            height={1024}
            className="h-auto w-full"
            priority
          />
        </div>
      </section>
    </main>
  );
}
