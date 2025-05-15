export const Dictionary = {
  explore: {
    title: 'Explorar Cursos',
    subtitle: 'Busca entre miles de cursos para oposiciones',
    loading: 'Inicializando motor de búsqueda...',
    showFilters: 'Mostrar filtros',
    hideFilters: 'Ocultar filtros',
  },
  search: {
    placeholder: 'Buscar cursos, instructores o categorías',
    noResults: 'No se encontraron cursos',
    tryAgain: 'Prueba con otros términos de búsqueda o filtros diferentes',
    explore: 'Explora los cursos disponibles',
    useSearch: 'Usa el buscador o los filtros para encontrar cursos',
    searching: 'Buscando cursos...',
    resultsCount: (count: number) => `${count} ${count === 1 ? 'curso encontrado' : 'cursos encontrados'}`,
  },
  filters: {
    title: 'Filtros',
    clearAll: 'Borrar todos',
    categories: 'Categorías',
    duration: 'Duración',
    level: 'Nivel',
  },
  suggestions: {
    courses: 'Cursos',
    instructors: 'Instructores',
    categories: 'Categorías',
  },
} as const;
