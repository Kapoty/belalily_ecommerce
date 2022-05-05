function toDate(dateStr) {
	return new Date(dateStr).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}

export {toDate}