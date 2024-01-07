<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import axios, { AxiosError } from 'axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useToast } from 'primevue/usetoast'

type QuibleTokens = {
  access_token?: string,
  refresh_token?: string
}

type ErrorPayload = {
  code: number,
  message: string
}

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

const { data: tokens, error: loginError, refetch: doLogin } = useQuery<QuibleTokens, AxiosError<ErrorPayload>>({
  queryKey: ['tokens'],
  enabled: false,
  retry: false,
  queryFn: () => {
    return axios.post<QuibleTokens>(
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
  }
})

const onSubmit = handleSubmit(
  async () => {
    await doLogin()
    if (loginError.value) {
      toast.add({
        severity: 'error',
        summary: 'Login failed',
        detail: loginError.value?.response?.data?.message ?? 'invalid credentials',
        life: 5000
      })
      return
    }
    console.log(tokens.value)
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
