import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import { CLIENT_PLUGIN_ID, clientFactoryBanner, clientFactoryFooter } from '../tsdown.client.shared.ts'

/** One registration the page's module system receives from a client bundle. */
interface Registration {
  id: string
  factory: (require: (request: string) => unknown) => Record<string, unknown>
}

/**
 * Evaluate the shared envelope around `body` under classic-script semantics —
 * the way the page's plain `<script>` tag executes a bundle — and collect the
 * registrations it makes.
 */
function registerEnvelope(body: string): Registration[] {
  const registrations: Registration[] = []
  vm.runInNewContext(`${clientFactoryBanner}\n${body}\n${clientFactoryFooter}`, {
    window: {
      __ModuleLoader__: {
        load: (registration: Registration) => {
          registrations.push(registration)
        },
      },
    },
  })
  return registrations
}

describe('client bundle envelope', () => {
  it('stamps the package identity the module system looks the factory up by', () => {
    expect(CLIENT_PLUGIN_ID).toBe('dsh-output-styles')
  })

  it('registers one factory that returns the CommonJS body exports', () => {
    const registrations = registerEnvelope(`
      var apply = function apply() {}
      var inject = ['commandUi', 'locale']
      var name = 'dsh-output-styles-client'
      exports.apply = apply
      exports.inject = inject
      exports.name = name
    `)
    expect(registrations).toHaveLength(1)
    const registration = registrations[0]
    expect(registration?.id).toBe(CLIENT_PLUGIN_ID)
    const client = registration?.factory(() => {
      throw new Error('the client bundle must not require externals')
    })
    expect(typeof client?.apply).toBe('function')
    expect(client?.inject).toEqual(['commandUi', 'locale'])
    expect(client?.name).toBe('dsh-output-styles-client')
  })

  it('opens the factory before the body and closes it by returning module.exports', () => {
    expect(clientFactoryBanner.startsWith('window.__ModuleLoader__.load({')).toBe(true)
    expect(clientFactoryBanner).toContain('factory: (require) => {')
    // The module envelope has to exist before rolldown's `exports.x = …` body.
    expect(clientFactoryBanner).toContain('var module = { exports: {} }')
    expect(clientFactoryBanner).toContain('var exports = module.exports')
    expect(clientFactoryFooter).toContain('return module.exports')
  })

  // The repository build and the consumer-side prepare build must emit the same
  // contract; a classic script that is really an ES module fails at parse time in
  // the page, which is exactly how the client half broke before.
  it.each(['tsdown.client.config.ts', 'tsdown.prepare.client.config.ts'])(
    '%s consumes the shared envelope and emits CommonJS',
    (relativePath) => {
      const source = readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
      expect(source).toContain("from './tsdown.client.shared.ts'")
      expect(source).toContain("format: ['cjs']")
      expect(source).toContain('banner: clientFactoryBanner')
      expect(source).toContain('footer: clientFactoryFooter')
    },
  )
})
