module.exports = {
  // Basic config to avoid false positives for Tailwind at-rules in editors
  // Editors like VSCode using Stylelint will pick this up and stop flagging
  // Tailwind at-rules such as @tailwind, @apply, @variants, @responsive, @screen
  // as unknown.
  extends: [
    'stylelint-config-recommended'
  ],
  rules: {
    // Allow Tailwind at-rules
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer', 'config']
      }
    ],
    // You can add more rules here if you want stricter checks later
  },
  ignoreFiles: ['**/node_modules/**', '.next/**', 'out/**']
};
