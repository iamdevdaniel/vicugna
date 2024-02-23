const formatDate = (date: Date | string) => {
    const days = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
    ]
    const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
    ]

    const parsedDate = (
        typeof date === 'string' ? new Date(date) : date
    ) as Date

    const dayOfWeek = days[parsedDate.getDay()]
    const day = parsedDate.getDate()
    const month = months[parsedDate.getMonth()]
    const year = parsedDate.getFullYear()

    return `${dayOfWeek} ${day} de ${month}, ${year}`
}

export default formatDate
