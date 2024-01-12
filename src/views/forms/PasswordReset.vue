<script setup lang="ts">
import Message from 'primevue/message'
import Card from 'primevue/card'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Skeleton from 'primevue//skeleton'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import axios, { AxiosError } from 'axios'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const validationSchema = toTypedSchema(
  yup.object({
    password: yup.string().required().min(6),
    confirmPassword: yup.string().required().test({
      name: 'match password',
      message: 'should match password',
      test: (value, testContext) => {
        return testContext.parent.password === value
      }
    })
  })
)
const { errors, isSubmitting, handleSubmit, defineField } = useForm({
  validationSchema
})
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')

const errorBanner = ref<string>()
const showForm = ref(false)
const isLoading = ref(true)
const route = useRoute()
const toast = useToast()

const onSubmit = handleSubmit(
  async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user/password-reset`,
        {
          token: route.query.token,
          step: 'define',
          password: password.value,
          confirmPassword: confirmPassword.value
        }
      )
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password has been successfully reset',
        life: 5000
      })
    } catch (e) {
      console.log(e)
      const message = (e as AxiosError<{message: string}>)?.response?.data?.message ?? 'unable to reset password'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message[0].toUpperCase() + message.slice(1),
        life: 5000
      })
    }
  }
)

onMounted(async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user/password-reset`,
      {
        token: route.query.token,
        step: 'validate'
      }
    )
    showForm.value = true
  } catch (e) {
    const message = (e as AxiosError<{message: string}>)?.response?.data?.message ?? 'unable to perform request'
    errorBanner.value = message[0].toUpperCase() + message.slice(1)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="h-full flex justify-content-center align-items-start p-5">
    <div v-if="isLoading" class="w-4 my-auto p-5 border-round border-1 surface-border surface-card">
      <Skeleton width="75%" height="2rem" />
      <div class="flex flex-column gap-4 w-full mt-5">
        <div class="flex flex-column gap-2">
          <Skeleton width="50%" height="1rem" />
          <Skeleton height="2.5rem" />
        </div>
        <div class="flex flex-column gap-2">
          <Skeleton width="50%" height="1rem" />
          <Skeleton height="2.5rem" />
        </div>
        <div class="mt-3">
          <Skeleton width="100%" height="3rem" />
        </div>
      </div>
    </div>
    <template v-else>
      <Card v-if="showForm" class="p-3 w-4 my-auto">
        <template #title>
          Quible password reset
        </template>
        <template #content>
          <form
            class="flex flex-column gap-2 w-full p-fluid"
            @submit="onSubmit"
          >
            <div class="flex flex-column gap-2">
              <label for="password">Password</label>
              <Password
                v-model="password"
                :feedback="false"
                :class="{ 'p-invalid': errors.password }"
                toggle-mask
                input-id="password"
                :input-props="{
                  autocomplete: 'true'
                }"
              />
              <small class="ml-1 p-error">
                {{ errors.password || '&nbsp;' }}
              </small>
            </div>
            <div class="flex flex-column gap-2">
              <label for="confirm-password">Confirm password</label>
              <Password
                v-model="confirmPassword"
                :feedback="false"
                :class="{ 'p-invalid': errors.confirmPassword }"
                toggle-mask
                input-id="confirm-password"
                :input-props="{
                  autocomplete: 'true'
                }"
              />
              <small class="ml-1 p-error">
                {{ errors.confirmPassword || '&nbsp;' }}
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
      <Message v-else-if="errorBanner" class="w-full" severity="error" :closable="false">
        {{ errorBanner }}
      </Message>
    </template>
  </div>
</template>
