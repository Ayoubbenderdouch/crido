import { useLocation, useParams } from 'react-router'

/** Detects /resource/new vs /resource/:id (id param is absent on dedicated "new" routes). */
export function useFormRoute() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const isNew = pathname.endsWith('/new')
  const numericId = isNew ? undefined : Number(id)

  return { isNew, numericId, paramId: id }
}
