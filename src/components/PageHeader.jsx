// En-tête de page des espaces connectés : titre, phrase d'aide, actions à droite.
export default function PageHeader({ title, text, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0"><h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>{text && <p className="mt-1 max-w-2xl text-slate-600">{text}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
