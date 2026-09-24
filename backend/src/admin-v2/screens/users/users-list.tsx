import type { UserListItem } from "../../../modules/users/user.types"

type UsersListProps = { users: UserListItem[]; emptyMessage: string }

export function UsersList({ users, emptyMessage }: UsersListProps) {
	if (users.length === 0)
		return (
			<p className="px-5 py-8 text-sm text-base-content/60">
				{emptyMessage}
			</p>
		)

	return (
		<div className="divide-y divide-base-300">
			{users.map((user) => (
				<article
					key={user.id}
					className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/25 font-bold text-neutral">
							{getInitials(user.fullName)}
						</div>
						<div className="min-w-0">
							<h3 className="truncate font-semibold">
								{user.fullName}
							</h3>
							<p className="text-sm text-base-content/60">
								<span>{user.phoneNumber}</span>
								<span className="px-2 text-base-content/30">
									•
								</span>
								<span>{user.email || "Sin correo"}</span>
							</p>
						</div>
					</div>
					<span
						className={`badge ${user.isActive ? "badge-success badge-soft" : "badge-neutral badge-soft"}`}
					>
						{user.isActive ? "Activo" : "Inactivo"}
					</span>
				</article>
			))}
		</div>
	)
}

function getInitials(fullName: string) {
	return fullName
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("")
}
