import { AxiosError } from "axios"
import _ from "lodash"
import { useMutation, UseMutationResult, useQueryClient } from "react-query"

import * as SettingsService from "services/SettingsService"

import {
  BackendSiteSettings,
  SiteColourSettings,
  SiteSettings,
} from "types/settings"

import { SETTINGS_CONTENT_KEY } from "../queryKeys"

import { FE_TO_BE } from "./constants"

const MEDIA_COLOUR_TITLES = [
  "media-color-one",
  "media-color-two",
  "media-color-three",
  "media-color-four",
  "media-color-five",
]

export const useUpdateSettings = (
  siteName: string
): UseMutationResult<void, AxiosError, SiteSettings> => {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError, SiteSettings>(
    (body) => SettingsService.update(siteName, convertfromFe(body)),
    {
      onSettled: () => {
        queryClient.invalidateQueries([SETTINGS_CONTENT_KEY, siteName])
      },
    }
  )
}

const convertfromFe = ({
  socialMediaContent,
  colours,
  ...basicSettings
}: SiteSettings): BackendSiteSettings => {
  // No nesting - just need to rename property value
  const renamedBasicSettings = _.mapKeys(
    basicSettings,
    (_value, key) => FE_TO_BE[key]
  )

  return {
    ...renamedBasicSettings,
    social_media: socialMediaContent,
    colors: convertColours(colours),
  }
}

const convertColours = ({
  primaryColour,
  secondaryColour,
  mediaColours,
}: SiteColourSettings): BackendSiteSettings["colors"] => {
  return {
    "primary-color": primaryColour,
    "secondary-color": secondaryColour,
    "media-colors": mediaColours.map((value, idx) => {
      return {
        title: MEDIA_COLOUR_TITLES[idx],
        color: value,
      }
    }),
  }
}