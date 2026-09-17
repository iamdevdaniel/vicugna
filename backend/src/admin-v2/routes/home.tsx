export function meta() {
	return [{ title: "Vicugna | Nuevo administrador" }]
}

export default function AdminV2Home() {
	return (
		<main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
			<section className="card w-full border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body gap-4">
					<div className="badge badge-primary badge-outline">
						/admin-v2
					</div>
					<h1 className="card-title text-3xl">Nuevo administrador</h1>
					<p className="max-w-2xl text-base-content/75">
						React Router está funcionando dentro del servidor
						Express existente. Las funciones del administrador se
						migrarán aquí por etapas.
					</p>
					<a className="btn btn-outline mt-2 w-fit" href="/admin">
						Abrir administrador actual
					</a>
				</div>
			</section>
		</main>
	)
}
