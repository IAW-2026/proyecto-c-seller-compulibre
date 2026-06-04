function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-primary/10 ${className}`} />;
}

function PageHeaderSkeleton({
  titleWidth = "w-56",
  withDescription = false,
}: {
  titleWidth?: string;
  withDescription?: boolean;
}) {
  return (
    <header>
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className={`mt-3 h-9 ${titleWidth}`} />
      {withDescription ? (
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
      ) : null}
    </header>
  );
}

function TableRowsSkeleton({
  rows = 6,
  columns = 3,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="divide-y divide-primary/10">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid items-center gap-4 px-3 py-4 md:px-5"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <SkeletonBlock
              key={columnIndex}
              className={[
                "h-5",
                columnIndex === 0 ? "w-full" : "w-3/4",
              ].join(" ")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({
  mobileColumns,
  desktopColumns,
}: {
  mobileColumns: number;
  desktopColumns: number;
}) {
  return (
    <section className="w-full overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm">
      <div className="border-b border-primary/10 bg-secondary/70 px-3 py-3 md:px-5">
        <div className="grid gap-4 md:hidden">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: mobileColumns }).map((_, index) => (
              <SkeletonBlock key={index} className="h-4" />
            ))}
          </div>
        </div>
        <div
          className="hidden gap-4 md:grid"
          style={{
            gridTemplateColumns: `repeat(${desktopColumns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: desktopColumns }).map((_, index) => (
            <SkeletonBlock key={index} className="h-4" />
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <TableRowsSkeleton rows={7} columns={mobileColumns} />
      </div>
      <div className="hidden md:block">
        <TableRowsSkeleton rows={7} columns={desktopColumns} />
      </div>
    </section>
  );
}

function SearchBarSkeleton({ withButton = false }: { withButton?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SkeletonBlock className="h-10 flex-1" />
      {withButton ? <SkeletonBlock className="h-10 w-full sm:w-44" /> : null}
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-9 w-9" />
      ))}
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <PageHeaderSkeleton titleWidth="w-44" />

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-4 h-8 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-40" />
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-primary/10 bg-white shadow-sm">
        <div className="border-b border-primary/10 px-5 py-4">
          <SkeletonBlock className="h-6 w-48" />
        </div>
        <TableRowsSkeleton rows={5} columns={4} />
      </section>
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeaderSkeleton titleWidth="w-64" />
      <SearchBarSkeleton withButton />
      <TableSkeleton mobileColumns={3} desktopColumns={6} />
      <PaginationSkeleton />
    </div>
  );
}

export function SalesPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeaderSkeleton titleWidth="w-60" withDescription />
      <SearchBarSkeleton />
      <TableSkeleton mobileColumns={2} desktopColumns={6} />
      <PaginationSkeleton />
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeaderSkeleton titleWidth="w-48" withDescription />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-7 w-32" />
          <SkeletonBlock className="h-10 flex-1 sm:max-w-md" />
        </div>
        <TableSkeleton mobileColumns={3} desktopColumns={7} />
        <PaginationSkeleton />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-7 w-24" />
          <SkeletonBlock className="h-10 flex-1 sm:max-w-md" />
        </div>
        <TableSkeleton mobileColumns={2} desktopColumns={6} />
        <PaginationSkeleton />
      </section>
    </div>
  );
}
