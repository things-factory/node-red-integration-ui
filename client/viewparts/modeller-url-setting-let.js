import { i18next, localize } from '@things-factory/i18n-base'
import { client, store } from '@things-factory/shell'
import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit-element'
import { connect } from 'pwa-helpers'

export const INTEGRATION_MODELLER_SETTINGS = {
  URL: {
    name: 'integration.modeller-url',
    description: 'Integration Modeller URL'
  },
  username: {
    name: 'integration.modeller-username',
    description: 'Integration Modeller Username'
  },
  password: {
    name: 'integration.modeller-password',
    description: 'Integration Modeller Password'
  }
}

export const INTEGRATION_MODELLER_SETTING_CATEGORY = 'integration'

export class IntegrationModellerSettingLet extends connect(store)(localize(i18next)(LitElement)) {
  static get styles() {
    return [
      css`
        setting-let > form {
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          grid-gap: 0.5rem;
        }

        mwc-textfield {
          text-transform: none;
        }

        mwc-icon-button {
          justify-self: end;
        }

        @media screen and (max-width: 460px) {
          setting-let > form {
            display: inline-grid;
            grid-template-columns: 1fr;
          }
        }
      `
    ]
  }

  static get properties() {
    return {
      url: String,
      username: String,
      password: String
    }
  }

  render() {
    return html`
      <setting-let>
        <i18n-msg slot="title" msgid="title.modeller url setting"></i18n-msg>

        <form slot="content">
          <mwc-textfield
            outlined
            type="url"
            label="URL"
            value=${this.url || ''}
            @change=${e => (this.url = e.target.value)}
          ></mwc-textfield>
          <mwc-textfield
            outlined
            type="text"
            label="username"
            value=${this.username || ''}
            @change=${e => (this.username = e.target.value)}
          ></mwc-textfield>
          <mwc-textfield
            outlined
            type="password"
            label="password"
            value=${this.password || ''}
            @change=${e => (this.password = e.target.value)}
          ></mwc-textfield>
          <mwc-icon-button icon="save" title=${i18next.t('button.save')} @click=${e => this.save(e)}></mwc-icon-button>
        </form>
      </setting-let>
    `
  }

  stateChanged(state) {
    var { url, username, password } = state.nodeRedIntegration
    this.url = url
    this.username = username
    this.password = password
  }

  save(e) {
    const settings = []

    ;[
      {
        key: 'URL',
        value: this.url
      },
      {
        key: 'username',
        value: this.username
      },
      {
        key: 'password',
        value: this.password
      }
    ].forEach(v => {
      settings.push({
        name: INTEGRATION_MODELLER_SETTINGS[v.key].name,
        description: INTEGRATION_MODELLER_SETTINGS[v.key].name,
        category: INTEGRATION_MODELLER_SETTING_CATEGORY,
        value: v.value
      })
    })

    this.saveSettings(settings)
  }

  async saveSettings(settings) {
    if (!settings?.length) return

    const promises = []
    settings.forEach(s => {
      promises.push(
        client.mutate({
          mutation: gql`
            mutation($name: String!, $patch: SettingPatch!) {
              updateSetting(name: $name, patch: $patch) {
                name
                value
              }
            }
          `,
          variables: {
            name: s.name,
            patch: s
          }
        })
      )
    })

    return Promise.resolve(promises)
  }
}

customElements.define('integration-modeller-setting-let', IntegrationModellerSettingLet)
