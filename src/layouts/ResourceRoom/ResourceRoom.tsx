import {
  Box,
  Divider,
  FormControl,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react"
import { Button, FormErrorMessage, Input } from "@opengovsg/design-system-react"
import _ from "lodash"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { BiInfoCircle } from "react-icons/bi"
import {
  Link as RouterLink,
  Redirect,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom"

import { useCreateDirectory, useGetDirectoryHook } from "hooks/directoryHooks"
import { useGetResourceRoomName } from "hooks/settingsHooks/useGetResourceRoomName"

import {
  Section,
  SectionHeader,
  SectionCaption,
  CreateButton,
} from "layouts/components"
import {
  DirectoryCreationScreen,
  DeleteWarningScreen,
  DirectorySettingsScreen,
} from "layouts/screens"
import { isDirectoryData } from "layouts/utils"

import { ProtectedRouteWithProps } from "routing/RouteSelector"

import { useErrorToast } from "utils/toasts"

import { DirectoryData, DirectoryInfoProps } from "types/directory"
import { ResourceRoomRouteParams } from "types/resources"
import { DEFAULT_RETRY_MSG } from "utils"

import { SiteViewLayout } from "../layouts"

import { CategoryCard, ResourceBreadcrumb } from "./components"

const EmptyResourceRoom = () => {
  const params = useParams<ResourceRoomRouteParams>()
  // NOTE: This is typed as any!!!
  const { siteName } = params
  const { mutateAsync: saveHandler, isLoading, isError } = useCreateDirectory(
    siteName
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newDirectoryName: "",
    },
  })

  const onSubmit = (data: DirectoryInfoProps["data"]) => {
    saveHandler({ data })
  }

  const errorToast = useErrorToast()

  // Trigger an error toast informing the user if settings data could not be fetched
  useEffect(() => {
    if (isError) {
      errorToast({
        title: "Error",
        description: `A new directory could not be created. ${DEFAULT_RETRY_MSG}`,
      })
    }
  }, [errorToast, isError])

  return (
    <SiteViewLayout>
      <Box as="form" w="full">
        {/* Resource Room does not exist */}
        <Section align="flex-start">
          <SectionHeader label="Create Resource Room" />
          <SectionCaption label="NOTE: " icon={BiInfoCircle}>
            You must create a Resource Room before you can create Resources.
          </SectionCaption>
          {/* Info segment */}
          <FormControl
            isRequired
            isInvalid={!!errors.newDirectoryName?.message}
          >
            <Input
              maxW="50%"
              {...register("newDirectoryName", { required: true })}
            />
            <FormErrorMessage>
              {errors.newDirectoryName?.message}
            </FormErrorMessage>
          </FormControl>
          {/* Segment divider  */}
          <Divider color="border.divider.alt" />
          <Button
            type="submit"
            isLoading={isLoading}
            onClick={handleSubmit(onSubmit)}
            isDisabled={!_.isEmpty(errors)}
          >
            Create Resource Room
          </Button>
        </Section>
      </Box>
    </SiteViewLayout>
  )
}

export const ResourceRoom = (): JSX.Element => {
  const { siteName, resourceRoomName } = useParams<ResourceRoomRouteParams>()
  const {
    data: queriedResourceRoomName,
    isLoading: isResourceRoomNameLoading,
  } = useGetResourceRoomName(siteName)
  const { path } = useRouteMatch()
  const history = useHistory()

  const shouldRedirect =
    (resourceRoomName && resourceRoomName !== queriedResourceRoomName) ||
    (!resourceRoomName && queriedResourceRoomName)

  // NOTE: dirsData is typed as any!!!
  const { data: _dirsData, isLoading } = useGetDirectoryHook(
    { siteName, resourceRoomName },
    {
      enabled:
        !!resourceRoomName && queriedResourceRoomName === resourceRoomName,
    }
  )
  // NOTE: These are obtained from JS files and are potentially unsafe
  // Do a type-check to narrow down to only those that are permissible and ensure safety
  const dirsData =
    _dirsData && _dirsData.length > 0
      ? (_dirsData as unknown[]).filter(isDirectoryData)
      : []

  return (
    <Route>
      {shouldRedirect && (
        <Redirect
          to={`/sites/${siteName}/resourceRoom/${
            queriedResourceRoomName || ""
          }`}
        />
      )}
      {!isResourceRoomNameLoading && !resourceRoomName ? (
        <EmptyResourceRoom />
      ) : (
        <ResourceRoomContent
          directoryData={dirsData}
          isLoading={!isLoading && !isResourceRoomNameLoading}
        />
      )}
      <Switch>
        <ProtectedRouteWithProps
          path={[`${path}/createDirectory`]}
          component={DirectoryCreationScreen}
          onClose={() => history.goBack()}
        />
        <ProtectedRouteWithProps
          path={[`${path}/deleteDirectory/:resourceCategoryName`]}
          component={DeleteWarningScreen}
          onClose={() => history.goBack()}
        />
        <ProtectedRouteWithProps
          path={[`${path}/editDirectorySettings/:resourceCategoryName`]}
          component={DirectorySettingsScreen}
          onClose={() => history.goBack()}
        />
      </Switch>
    </Route>
  )
}

interface ResourceRoomContentProps {
  directoryData: DirectoryData[]
  isLoading?: boolean
}

const ResourceRoomContent = ({
  directoryData,
  isLoading,
}: ResourceRoomContentProps): JSX.Element => {
  const { url } = useRouteMatch()

  return (
    <SiteViewLayout>
      <Section>
        <Box>
          <Text as="h2" textStyle="h2">
            Resources
          </Text>
          <ResourceBreadcrumb />
        </Box>
      </Section>
      <Section>
        <SectionHeader label="Categories">
          <CreateButton as={RouterLink} to={`${url}/createDirectory`}>
            Create category
          </CreateButton>
        </SectionHeader>
        <Skeleton isLoaded={isLoading} w="100%">
          {directoryData.length === 0 ? (
            <Text>No Categories.</Text>
          ) : (
            directoryData &&
            directoryData.length > 0 && (
              <SimpleGrid columns={3} spacing="1.5rem">
                {directoryData.map(({ name }) => (
                  <CategoryCard title={name} />
                ))}
              </SimpleGrid>
            )
          )}
        </Skeleton>
      </Section>
    </SiteViewLayout>
  )
}