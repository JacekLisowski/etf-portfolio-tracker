import {
  Box,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Button,
  VStack,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  Skeleton,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/middleware/withAuthPage'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useLanguage, useLabels } from '@/contexts/LanguageContext'

const profileSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  language: z.enum(['PL', 'EN']),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { data: profile, isLoading: isLoadingProfile } = useProfile()
  const updateProfile = useUpdateProfile()
  const { setLanguage } = useLanguage()
  const labels = useLabels()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      language: 'PL',
    },
  })

  // Watch language for radio group
  const watchedLanguage = watch('language')

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name || '')
      setValue('language', profile.language)
    }
  }, [profile, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name || null,
        language: data.language,
      })

      // Update language context immediately
      setLanguage(data.language)

      // Trigger session update to refresh the JWT with new data
      await updateSession()

      toast({
        title: labels.settings.profileUpdated,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch {
      toast({
        title: labels.errors.general,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <AppLayout>
      <VStack spacing={6} align="stretch" maxW="600px">
        <Heading size="lg">{labels.settings.title}</Heading>

        <Card>
          <CardHeader>
            <Heading size="md">{labels.settings.profile}</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4} align="stretch">
                {/* Email (read-only) */}
                <FormControl>
                  <FormLabel>{labels.settings.email}</FormLabel>
                  {isLoadingProfile ? (
                    <Skeleton height="40px" />
                  ) : (
                    <Input
                      value={session?.user?.email || ''}
                      isReadOnly
                      isDisabled
                      bg="gray.100"
                      _dark={{ bg: 'gray.700' }}
                    />
                  )}
                </FormControl>

                {/* Name (editable) */}
                <FormControl>
                  <FormLabel>{labels.settings.name}</FormLabel>
                  {isLoadingProfile ? (
                    <Skeleton height="40px" />
                  ) : (
                    <Input
                      {...register('name')}
                      placeholder={labels.settings.namePlaceholder}
                    />
                  )}
                </FormControl>

                {/* Language selector */}
                <FormControl>
                  <FormLabel>{labels.settings.language}</FormLabel>
                  {isLoadingProfile ? (
                    <Skeleton height="40px" />
                  ) : (
                    <RadioGroup
                      value={watchedLanguage}
                      onChange={(value: 'PL' | 'EN') => setValue('language', value)}
                    >
                      <Stack direction="row" spacing={4}>
                        <Radio value="PL">{labels.settings.languagePolski}</Radio>
                        <Radio value="EN">{labels.settings.languageEnglish}</Radio>
                      </Stack>
                    </RadioGroup>
                  )}
                </FormControl>

                {/* Save button */}
                <Box pt={4}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isSubmitting || updateProfile.isPending}
                    loadingText={labels.actions.loading}
                  >
                    {labels.settings.saveChanges}
                  </Button>
                </Box>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  )
}

export const getServerSideProps = requireAuth
