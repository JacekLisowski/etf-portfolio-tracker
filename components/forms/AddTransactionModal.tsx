import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EtfSearchInput, EtfOption } from './EtfSearchInput'
import { LABELS } from '@/config/labels'
import { SUPPORTED_CURRENCIES, TRANSACTION_TYPES } from '@/config/constants'

// Zod schema for transaction form
const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date <= new Date()
  }, LABELS.transaction.validation.invalidDate),
  etf: z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    isin: z.string(),
    exchange: z.string(),
  }).nullable(),
  quantity: z.number().positive(LABELS.transaction.validation.quantityTooLow),
  price: z.number().positive(LABELS.transaction.validation.priceTooLow),
  currency: z.enum(SUPPORTED_CURRENCIES),
  commission: z.number().min(0).optional(),
  notes: z.string().optional(),
}).refine((data) => data.etf !== null, {
  message: LABELS.transaction.validation.required,
  path: ['etf'],
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  portfolioId: string
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  portfolioId,
}: AddTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'BUY',
      date: new Date().toISOString().split('T')[0],
      etf: null,
      quantity: undefined,
      price: undefined,
      currency: 'EUR',
      commission: 0,
      notes: '',
    },
  })

  const transactionType = watch('type')

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etfId: data.etf?.id,
          type: data.type,
          date: new Date(data.date).toISOString(),
          quantity: data.quantity,
          pricePerUnit: data.price,
          currency: data.currency,
          fees: data.commission || 0,
          notes: data.notes || '',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Transaction failed')
      }

      toast({
        title: LABELS.success.transactionCreated,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: LABELS.errors.general,
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{LABELS.transaction.title}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              {/* Transaction Type */}
              <FormControl isInvalid={!!errors.type}>
                <FormLabel>{LABELS.transaction.form.type}</FormLabel>
                <Select {...register('type')}>
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {LABELS.transaction.types[type]}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
              </FormControl>

              {/* Date */}
              <FormControl isInvalid={!!errors.date}>
                <FormLabel>{LABELS.transaction.form.date}</FormLabel>
                <Input type="date" {...register('date')} />
                <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
              </FormControl>

              {/* ETF Search */}
              <FormControl isInvalid={!!errors.etf}>
                <FormLabel>{LABELS.transaction.form.etf}</FormLabel>
                <Controller
                  name="etf"
                  control={control}
                  render={({ field }) => (
                    <EtfSearchInput
                      value={field.value as EtfOption | null}
                      onChange={field.onChange}
                      placeholder={LABELS.transaction.form.selectEtf}
                    />
                  )}
                />
                <FormErrorMessage>{errors.etf?.message}</FormErrorMessage>
              </FormControl>

              {/* Quantity & Price */}
              <HStack width="100%" spacing={4}>
                <FormControl isInvalid={!!errors.quantity}>
                  <FormLabel>{LABELS.transaction.form.quantity}</FormLabel>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        min={0}
                        precision={4}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                      >
                        <NumberInputField
                          placeholder={LABELS.transaction.form.enterQuantity}
                        />
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>{LABELS.transaction.form.price}</FormLabel>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        min={0}
                        precision={4}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                      >
                        <NumberInputField
                          placeholder={LABELS.transaction.form.enterPrice}
                        />
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Currency & Commission */}
              <HStack width="100%" spacing={4}>
                <FormControl isInvalid={!!errors.currency}>
                  <FormLabel>{LABELS.transaction.form.currency}</FormLabel>
                  <Select {...register('currency')}>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr} - {LABELS.currency[curr]}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.currency?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.commission}>
                  <FormLabel>{LABELS.transaction.form.commission}</FormLabel>
                  <Controller
                    name="commission"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        min={0}
                        precision={2}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                      >
                        <NumberInputField
                          placeholder={LABELS.transaction.form.enterCommission}
                        />
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>{errors.commission?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Notes */}
              <FormControl isInvalid={!!errors.notes}>
                <FormLabel>{LABELS.transaction.form.notes}</FormLabel>
                <Textarea
                  {...register('notes')}
                  placeholder={LABELS.transaction.form.enterNotes}
                  rows={3}
                />
                <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              {LABELS.actions.cancel}
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              {LABELS.actions.save}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
