<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const validationSchema = toTypedSchema(
  yup.object({
    email: yup.string().email().required()
  })
)

const { errors, isSubmitting, meta, handleSubmit, defineField } = useForm({
  validationSchema
})

// const { value: email } = useField<string>('email')
const [email] = defineField('email', (state) => {
  return {
    validateOnModelUpdate: (state?.value?.length ?? 0) >= 3
  }
})

const toast = useToast()

const onSubmit = handleSubmit(
  async (values, actions) => {
    console.log(values)
    await new Promise(
      resolve => setTimeout(resolve, 2000)
    )
    toast.add({ severity: 'info', summary: 'Form Submitted', detail: values.email, life: 3000 })
    actions.resetForm()
  }
)

</script>

<template>
  <div class="h-full flex align-items-center justify-content-center flex-column">
    <form
      class="flex flex-column gap-2"
      @submit="onSubmit"
    >
      <label for="year">Enter a valid email</label>
      <InputText
        id="year"
        v-model="email"
        :class="{ 'p-invalid': errors.email }"
      />
      <small class="p-error">
        {{ errors.email || '&nbsp;' }}
      </small>
      <Button
        :icon="`${isSubmitting ? 'pi pi-ellipsis-h pi-spin' : ''}`"
        :disabled="!meta.dirty || isSubmitting"
        type="submit"
        label="Submit"
      />
      <!-- <Field type="email" name="email" /> -->
    </form>
  </div>
</template>

<style lang="scss" scoped>

</style>
