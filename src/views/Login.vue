<script setup lang="ts">
import { QueryClient } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useToast } from 'primevue/usetoast'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { QuibleTokens } from '@/types'

const quibleTokens = useStorage<QuibleTokens>('tokens', {})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000
    }
  }
})

const toast = useToast()

const validationSchema = toTypedSchema(
  yup.object({
    email: yup.string().email().required().default('simonbaev@gmail.com'),
    password: yup.string().required().default('password')
  })
)

const { errors, isSubmitting, handleSubmit, defineField } = useForm({
  validationSchema
})

const [email] = defineField('email')
const [password] = defineField('password')
const loginQueryKey = computed(
  () => ['tokens', email.value, password.value]
)

const onSubmit = handleSubmit(
  async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: loginQueryKey,
        retry: false,
        queryFn: () => axios.post<QuibleTokens>(
          `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/login`,
          {
            email: email.value,
            password: password.value
          }
        ).then(
          ({ data }) => {
            return data
          }
        )
      })
      quibleTokens.value = data
      // redirect to ...
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof AxiosError) {
        errorMessage = error?.response?.data?.message ?? 'invalid credentials'
      }
      toast.add({
        severity: 'error',
        summary: 'Login failed',
        detail: errorMessage,
        life: 5000
      })
    }
  }
)

</script>

<template>
  <div class="h-full flex justify-content-center align-items-center">
    <Card>
      <template #title>
        Quible Login
      </template>
      <template #content>
        <form
          class="flex flex-column gap-2"
          @submit="onSubmit"
        >
          <div class="flex flex-column gap-2">
            <label for="email">Email</label>
            <InputText
              v-model="email"
              :class="{ 'p-invalid': errors.email }"
            />
            <small class="p-error">
              {{ errors.email || '&nbsp;' }}
            </small>
          </div>
          <div class="flex flex-column gap-2">
            <label for="email">Password</label>
            <Password
              v-model="password"
              :feedback="false"
              :class="{ 'p-invalid': errors.password }"
              toggle-mask
            />
            <small class="p-error">
              {{ errors.password || '&nbsp;' }}
            </small>
          </div>

          <Button
            :icon="`${isSubmitting ? 'pi pi-ellipsis-h pi-spin' : ''}`"
            :disabled="isSubmitting"
            type="submit"
            label="Submit"
          />
        </form>
      </template>
    </Card>
  </div>
</template>
