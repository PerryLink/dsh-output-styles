/**
 * The module envelope both client-bundle configs (`build` for the repository
 * and `prepare` for consumer-side Git/tarball installs) must emit.
 *
 * The Web client bundle is a CLASSIC script, not an ES module. The Host serves
 * the built `lib/client.js` bytes verbatim (`dsh-client-modules` reads the
 * artifact and answers it from `/plugins`) and the page injects them with a
 * plain `<script>` tag. That script has to register a lazy factory through
 * `window.__ModuleLoader__.load({ id, factory })`; a top-level `export`
 * statement is a parse error in that context, so nothing registers and the page
 * reports `loaded without registering "dsh-output-styles" via
 * __ModuleLoader__.load`.
 *
 * Rolldown emits the CommonJS body (`exports.apply = apply`); the banner and
 * footer below supply the module envelope that body expects and hand the factory
 * its `require`. This reproduces the artifact DeepSeek Harness's own
 * `clientBundle()` tsdown preset emits for its first-party UI plugins.
 */

/**
 * Plugin id stamped into the handoff. It must equal the package name: the
 * browser module system keys its boot graph, its factory table and every
 * `require("<id>")` on the package identity, so a mismatched id registers a
 * factory nothing can look up.
 */
export const CLIENT_PLUGIN_ID = 'dsh-output-styles'

/** Opens the factory: `module`/`exports` must exist before the CJS body runs. */
export const clientFactoryBanner = [
  'window.__ModuleLoader__.load({',
  `\tid: ${JSON.stringify(CLIENT_PLUGIN_ID)},`,
  '\tfactory: (require) => {',
  '\t\tvar module = { exports: {} };',
  '\t\tvar exports = module.exports;',
].join('\n')

/** Closes the factory and returns the module's exports to the loader. */
export const clientFactoryFooter = ['\t\treturn module.exports;', '\t}', '});'].join('\n')
