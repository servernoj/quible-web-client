<script setup lang="ts">
import Card from 'primevue/card'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import { useToast } from 'primevue/usetoast'
import axios, { AxiosError } from 'axios'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import InputText from 'primevue/inputtext'

const validationSchema = toTypedSchema(
  yup.object({
    email: yup.string().required().email(),
    username: yup.string().required(),
    fullName: yup.string().required(),
    password: yup.string().required().min(6),
    phone: yup.string().required().test({
      name: 'phone format',
      message: 'shoud have at least 10 digits',
      test: (value) => {
        return /^[0-9() +-]{10,}$/.test(value)
      }
    })
  })
)
const { errors, isSubmitting, handleSubmit, defineField } = useForm({
  validationSchema
})
const [email] = defineField('email')
const [username] = defineField('username')
const [fullName] = defineField('fullName')
const [phone] = defineField('phone')
const [password] = defineField('password')

const toast = useToast()

const onSubmit = handleSubmit(
  async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user`,
        {
          email: email.value,
          username: username.value,
          full_name: fullName.value,
          phone: phone.value,
          password: password.value
        }
      )
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User has been created',
        life: 5000
      })
    } catch (e) {
      console.log(e)
      const message = (e as AxiosError<{message: string}>)?.response?.data?.message ?? 'unable to register user'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message[0].toUpperCase() + message.slice(1),
        life: 5000
      })
    }
  }
)
</script>

<template>
  <div class="h-full flex justify-content-center align-items-start p-3">
    <Card class="p-3 w-full lg:w-4 my-auto">
      <template #title>
        Quible user registration
      </template>
      <template #content>
        <form
          class="flex flex-column gap-1 p-fluid"
          @submit="onSubmit"
        >
          <!-- Name -->
          <div class="flex flex-column gap-2">
            <label for="full-name">Full name</label>
            <InputText
              v-model="fullName"
              :class="{ 'p-invalid': errors.fullName }"
              input-id="full-name"
            />
            <small class="ml-1 p-error">
              {{ errors.fullName || '&nbsp;' }}
            </small>
          </div>
          <!-- Email -->
          <div class="flex flex-column gap-2">
            <label for="email">Email</label>
            <InputText
              v-model="email"
              :class="{ 'p-invalid': errors.email }"
              input-id="email"
            />
            <small class="ml-1 p-error">
              {{ errors.email || '&nbsp;' }}
            </small>
          </div>
          <!-- Username -->
          <div class="flex flex-column gap-2">
            <label for="username">Nickname</label>
            <InputText
              v-model="username"
              :class="{ 'p-invalid': errors.username }"
              input-id="username"
            />
            <small class="ml-1 p-error">
              {{ errors.username || '&nbsp;' }}
            </small>
          </div>
          <!-- Phone -->
          <div class="flex flex-column gap-2">
            <label for="phone">Phone</label>
            <InputText
              v-model="phone"
              :class="{ 'p-invalid': errors.phone }"
              input-id="phone"
            />
            <small class="ml-1 p-error">
              {{ errors.phone || '&nbsp;' }}
            </small>
          </div>
          <!-- Password -->
          <div class="flex flex-column gap-2">
            <label for="password">Password</label>
            <Password
              v-model="password"
              :feedback="false"
              :class="{ 'p-invalid': errors.password }"
              toggle-mask
              input-id="password"
            />
            <small class="ml-1 p-error">
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
