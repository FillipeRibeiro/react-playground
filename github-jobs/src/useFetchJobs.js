import { useReducer, useEffect } from 'react'
import axios from 'axios'

const BASE_URL = 'https://jobs.github.com/positions.json'
const PROXY_SERVER = 'https://cors-anywhere.herokuapp.com/'

const ACTIONS = {
  UPDATE_HAS_NEXT_PAGE: 'update-has-next-page',
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error'
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] }
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs }
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] }
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage }
    default:
      return state
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true})

  useEffect(() => {
    const cancelToken = axios.CancelToken.source()
    const cancelTokenUpdateHasNextPage = axios.CancelToken.source()

    dispatch({ type: ACTIONS.MAKE_REQUEST })
    axios.get(PROXY_SERVER + BASE_URL, {
      cancelToken: cancelToken.token,
      params: { markdown: true, page: page, ...params }
    }).then(response => {
      dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: response.data } })
    }). catch(err => {
      if (axios.isCancel(err)) return
      dispatch({ type: ACTIONS.ERROR, payload: { error: err } })
    })

    axios.get(PROXY_SERVER + BASE_URL, {
      cancelToken: cancelTokenUpdateHasNextPage.token,
      params: { markdown: true, page: page + 1, ...params }
    }).then(response => {
      dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { 
        hasNextPage: response.data.length !== 0 } })
    }). catch(err => {
      if (axios.isCancel(err)) return
      dispatch({ type: ACTIONS.ERROR, payload: { error: err } })
    })

    return () => {
      cancelToken.cancel()
      cancelTokenUpdateHasNextPage.cancel()
    }
  }, [params, page])

  return state
}
