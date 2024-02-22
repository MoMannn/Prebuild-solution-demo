<script lang="ts" setup>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import type { FormInst, FormRules, FormValidationError } from 'naive-ui';
import { ruleRequired } from '~/lib/utils/validation';

type SignupForm = {
  email: string | null;
  token?: any;
};

const router = useRouter();

const message = useMessage();
const emit = defineEmits(['submitSuccess']);

const {
  loading,
  captchaKey,
  captchaInput,
  onCaptchaChallengeExpire,
  onCaptchaClose,
  onCaptchaError,
  onCaptchaExpire,
} = useCaptcha();
const { handleError } = useErrors();

const formRef = ref<FormInst | null>(null);
const formData = ref<SignupForm>({
  email: null,
  token: null as any,
});

const rules: FormRules = {
  email: [
    ruleRequired('Please enter your email'),
    { type: 'email', message: 'Please enter a valid email address' },
  ],
  token: [ruleRequired('Please solve captcha')],
};

function handleSubmit(e: MouseEvent | null) {
  e?.preventDefault();
  formRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
    if (errors) {
      errors.map(fieldErrors =>
        fieldErrors.map(error => message.warning(error.message || 'Error'))
      );
    } else if (!formData.value.token) {
      captchaInput.value.execute();
    } else {
      await signUp();
    }
  });
}

async function signUp() {
  loading.value = true;

  try {
    const res = await $api.post<SuccessResponse>('/users', formData.value);

    if (res.data && res.data.success) {
      emit('submitSuccess');

      router.push({ path: '/success' });
    }
  } catch (e) {
    handleError(e);
  }

  loading.value = false;
}

function onCaptchaVerify(token: string) {
  formData.value.token = token;
}
</script>

<template>
  <n-form ref="formRef" :model="formData" :rules="rules" @submit.prevent="handleSubmit">
    <!--  Login email -->
    <n-form-item path="email" label="Email">
      <n-input
        v-model:value="formData.email"
        :input-props="{ type: 'email' }"
        placeholder="test@email.com"
        clearable
      />
    </n-form-item>

    <!-- Hcaptcha -->
    <vue-hcaptcha
      ref="captchaInput"
      :sitekey="captchaKey"
      theme="dark"
      @error="onCaptchaError"
      @verify="onCaptchaVerify"
      @expired="onCaptchaExpire"
      @challenge-expired="onCaptchaChallengeExpire"
      @closed="onCaptchaClose"
    />

    <!--  Form submit -->
    <n-form-item :show-feedback="false">
      <input type="submit" class="hidden" />
      <Btn
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!formData.email || !formData.token"
        @click="handleSubmit"
      >
        Sign up
      </Btn>
    </n-form-item>
  </n-form>
</template>
