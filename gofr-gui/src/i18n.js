import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en', // set locale
  fallbackLocale: 'en',
  messages: {} // set locale messages
})

export function loadLanguage(lang) {
  axios.get( `/translator/getLocale/${lang}` ).then(response => {
    i18n.setLocaleMessage(lang, response.data)
    i18n.locale = lang
  })
  // if we want to implement lazzy loading then refer to https://kazupon.github.io/vue-i18n/guide/lazy-loading.html
}