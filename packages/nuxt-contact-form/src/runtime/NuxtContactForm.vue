<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useAppConfig } from '#imports'
import { defaultOptions, validPrivacyUrl, type ModuleOptions } from './config'
import { challenge } from './challenge'
import { sendContact } from './send'

// Native fallback is inert. Only the explicit live action performs a bounded JSON POST.
// SSR controls stay disabled until hydration; no input persistence or analytics.
const options = {...defaultOptions, ...useAppConfig().contactForm as Partial<ModuleOptions>}
const props = withDefaults(defineProps<{ privacyUrl?: string }>(), { privacyUrl: '' })
const candidatePrivacyUrl = props.privacyUrl || options.privacyUrl
const privacyUrl = validPrivacyUrl(candidatePrivacyUrl) ? candidatePrivacyUrl : ''
const live = options.mode === 'live' && Boolean(privacyUrl)
const challengeElement = ref<HTMLElement>()
const token = ref('')
const busy = ref(false)
const locked = ref(false)
let dispose: (() => void) | undefined
const submissionId = ref('')
const ready = ref(false)
onMounted(() => { ready.value = true })
const fields = reactive({ email: '', subject: '', message: '', consent: false })
const confirming = ref(false)
const notice = ref('')
const heading = ref<HTMLHeadingElement>()
async function review() {
  confirming.value = true
  notice.value = ''
  await nextTick()
  heading.value?.focus()
}

watch(confirming, async value => {
  dispose?.()
  await nextTick()
  if (value && live && challengeElement.value && !locked.value) dispose = challenge(challengeElement.value, options.turnstileSiteKey, value => { token.value = value })
})
onBeforeUnmount(() => dispose?.())
async function send() {
 if (!live || busy.value || locked.value || !token.value) return
 busy.value = true
 submissionId.value ||= crypto.randomUUID()
 const result = await sendContact(options.endpoint, {siteKey: options.siteKey, email: fields.email, subject: fields.subject, message: fields.message, turnstileToken: token.value, submissionId: submissionId.value, policyVersion: options.policyVersion})
 dispose?.()
 busy.value = false
 locked.value = true
 notice.value = result === 'accepted' ? '配送サービスが受け付けました。受信箱への到着を保証するものではありません。' : result === 'rejected' ? '送信は許可されませんでした。入力内容や接続条件をご確認ください。' : '結果を確認できませんでした。重複を防ぐため、続けて送信しないでください。'
}
</script>

<template>
  <section class="contact-preview" aria-label="お問い合わせフォームの表示プレビュー">
    <p v-if="!live" class="preview-label">表示プレビュー · メールは送信されません</p>
    <h1 ref="heading" tabindex="-1">{{ confirming ? '入力内容の確認' : 'お問い合わせ' }}</h1>
    <p class="intro">{{ confirming ? (live ? '入力内容をご確認ください。' : '表示内容をご確認ください。ここでは実際の受付は行いません。') : 'ご相談・ご質問をお寄せください。必須の項目をご入力ください。' }}</p>
    <form v-if="!confirming" method="dialog" @submit.prevent="review">
      <noscript><p>JavaScriptが利用できないため、フォームの操作は無効です。</p></noscript>
      <fieldset :disabled="!ready">
      <label>メールアドレス <span>必須</span><input v-model="fields.email" type="email" autocomplete="email" required maxlength="254" placeholder="name@example.com"><small>返信を受け取るメールアドレスをご入力ください。</small></label>
      <label>件名 <span>必須</span><input v-model="fields.subject" required maxlength="150" placeholder="ご相談の概要"></label>
      <label>お問い合わせ内容 <span>必須</span><textarea v-model="fields.message" required maxlength="5000" rows="6" placeholder="お問い合わせ内容をご記入ください。"></textarea><small>パスワードや認証情報などの秘密情報は記入しないでください。</small></label>
      <label class="consent"><input v-model="fields.consent" type="checkbox" required><span class="consent-text"><template v-if="privacyUrl"><a :href="privacyUrl">個人情報の取り扱い</a>を確認しました。</template><template v-else>個人情報の取り扱いの確認欄（表示確認用）</template></span></label>
      <p v-if="!privacyUrl" class="policy-note">公開時には、このサイトの個人情報の取り扱いへのリンクを設定します。</p>
      <button type="submit">入力内容を確認する <span aria-hidden="true">→</span></button>
      </fieldset>
    </form>
    <div v-else>
      <dl><template v-for="item in ([['メールアドレス', fields.email], ['件名', fields.subject], ['お問い合わせ内容', fields.message]])" :key="item[0]"><dt>{{ item[0] }}</dt><dd>{{ item[1] }}</dd></template></dl>
      <div v-if="live" ref="challengeElement" aria-label="送信前の不正利用防止確認"></div>
      <div class="actions"><button type="button" class="secondary" :disabled="busy || locked" @click="confirming = false">入力に戻る</button><button v-if="!live" type="button" @click="notice = 'プレビューの確認が完了しました。メールは送信していません。'">プレビューを完了する</button><button v-else type="button" :disabled="busy || locked || !token" @click="send">{{ busy ? '送信中…' : '送信する' }}</button></div>
      <p role="status">{{ notice }}</p>
    </div>
  </section>
</template>

<style scoped>
fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.contact-preview { max-width: 42rem; margin: 3rem auto; padding: 0 1.25rem 3rem; color: #172538; font-family: sans-serif; line-height: 1.7; }
.preview-label { display: inline-block; padding: .3rem .8rem; border: 1px solid #bfd3ec; border-radius: 6px; background: #eff6ff; color: #234e80; font-size: .8rem; }
h1 { font-size: 2rem; font-weight: 700; margin: 1.3rem 0 .5rem; letter-spacing: .06em; }
.intro { color: #536174; margin-bottom: 2rem; }
label { display: block; margin: 1.4rem 0; font-weight: 600; }
label > span:not(.consent-text) { font-size: .7rem; color: #a32b37; margin-left: .5rem; background: #fff1f2; padding: .15rem .4rem; border-radius: 3px; }
input:not([type=checkbox]), textarea { display: block; box-sizing: border-box; width: 100%; margin-top: .5rem; padding: .7rem .8rem; border: 1px solid #94a3b8; border-radius: 5px; background: white; color: #172538; font: inherit; font-weight: 400; }
textarea { resize: vertical; }
small, .policy-note { display: block; font-size: .8rem; font-weight: 400; color: #536174; margin-top: .4rem; }
.consent { display: flex; gap: .7rem; align-items: start; font-size: .9rem; font-weight: 400; margin-bottom: .4rem; }
input[type=checkbox] { width: 1.2rem; height: 1.2rem; flex: 0 0 auto; margin-top: .2rem; accent-color: #1857a4; }
button:disabled { opacity: .55; cursor: not-allowed; }
a { color: #1857a4; text-decoration: underline; }
button { display: inline-flex; justify-content: center; gap: 2rem; background: #1857a4; color: white; border: 1px solid #1857a4; padding: .8rem 1.5rem; border-radius: 5px; font: inherit; cursor: pointer; margin-top: 1.6rem; }
.secondary { background: white; color: #1857a4; }
.actions { display: flex; flex-wrap: wrap; gap: 1rem; }
dt { font-weight: 600; margin-top: 1.2rem; }
dd { margin: .4rem 0 1rem; white-space: pre-wrap; overflow-wrap: anywhere; }
:is(input, textarea, button, a):focus-visible { outline: 3px solid #e2a400; outline-offset: 3px; }
@media(max-width: 480px) { .contact-preview { margin-top: 1.5rem; } button { width: 100%; } }
</style>
