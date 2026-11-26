export default function Loading() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36" aria-busy="true" aria-label="Cargando">
      <div className="skeleton-light mb-5 h-4 w-40 rounded-full" />
      <div className="skeleton-light mb-4 h-12 w-2/3 max-w-lg rounded-2xl" />
      <div className="skeleton-light mb-14 h-5 w-1/2 max-w-md rounded-full" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton-light aspect-[4/5] rounded-card" />
            <div className="skeleton-light mt-5 h-3 w-1/3 rounded-full" />
            <div className="skeleton-light mt-3 h-5 w-3/4 rounded-full" />
            <div className="skeleton-light mt-4 h-4 w-1/4 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
