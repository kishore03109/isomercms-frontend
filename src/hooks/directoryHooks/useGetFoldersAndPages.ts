import { useQuery, UseQueryOptions, UseQueryResult } from "react-query"

import { DIR_CONTENT_KEY } from "constants/queryKeys"

import useRedirectHook from "hooks/useRedirectHook"

import * as DirectoryService from "services/DirectoryService/index"

import { isAxiosError } from "utils/axios"
import { useErrorToast } from "utils/toasts"

import { DirectoryData, PageData } from "types/directory"
import { PageDirectoryParams } from "types/folders"
import { DEFAULT_RETRY_MSG } from "utils"

export const useGetFoldersAndPages = (
  params: PageDirectoryParams,
  queryOptions?: Omit<
    UseQueryOptions<(PageData | DirectoryData)[]>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<(PageData | DirectoryData)[]> => {
  const { setRedirectToNotFound } = useRedirectHook()
  const errorToast = useErrorToast()

  return useQuery<(PageData | DirectoryData)[]>(
    [DIR_CONTENT_KEY, params],
    () => DirectoryService.getCollection(params),
    {
      ...queryOptions,
      retry: false,
      onError: (err) => {
        console.log(err)
        if (isAxiosError(err) && err.response && err.response.status === 404) {
          setRedirectToNotFound()
        } else {
          errorToast({
            description: `There was a problem retrieving directory contents. ${DEFAULT_RETRY_MSG}`,
          })
        }
        queryOptions?.onError?.(err)
      },
    }
  )
}
