import type { ReactNode } from "react"

type HomeSectionCardProps = {
	title: string
	description: string
	href: string
	icon: ReactNode
}

export function HomeSectionCard({
	title,
	description,
	href,
	icon,
}: HomeSectionCardProps) {
	return (
		<a
			href={href}
			className="group card h-full min-h-56 border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md"
		>
			<div className="card-body">
				<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-content">
					{icon}
				</div>
				<div className="mt-5 flex items-center justify-between gap-4">
					<h2 className="text-2xl font-semibold">{title}</h2>
					<span
						className="text-2xl text-primary transition-transform group-hover:translate-x-1"
						aria-hidden="true"
					>
						→
					</span>
				</div>
				<p className="mt-2 text-sm leading-6 text-base-content/65">
					{description}
				</p>
			</div>
		</a>
	)
}
