import type { TransformOptions } from '@babel/core';
import { precompile } from 'ember-source/dist/ember-template-compiler';

import { findDistEsm } from '@storybook/core-common';

import type { StorybookConfig, Options } from '@storybook/core-common';

let emberOptions: any;

function precompileWithPlugins(string: string, options: any) {
  const precompileOptions: any = options;
  if (emberOptions && emberOptions.polyfills) {
    precompileOptions.plugins = { ast: emberOptions.polyfills };
  }

  return precompile(string, precompileOptions);
}

export function babel(config: TransformOptions, options: Options): TransformOptions {
  if (options && options.presetsList) {
    options.presetsList.forEach((e: any, index: number) => {
      if (e.preset && e.preset.emberOptions) {
        emberOptions = e.preset.emberOptions;
        // eslint-disable-next-line no-param-reassign
        delete options.presetsList[index].preset.emberOptions;
      }
    });
  }

  const babelConfigPlugins = config.plugins || [];

  const extraPlugins = [
    [
      require.resolve('babel-plugin-ember-template-compilation'),
      {
        precompile: precompileWithPlugins,
        outputModuleOverrides: {
          '@ember/template-factory': {
            createTemplateFactory: ['createTemplateFactory', '@glimmer/core'],
          },
        },
        enableLegacyModules: [
          'ember-cli-htmlbars',
          'ember-cli-htmlbars-inline-precompile',
          'htmlbars-inline-precompile',
        ],
      },
    ],
  ];

  return {
    ...config,
    plugins: [].concat(babelConfigPlugins, extraPlugins),
  };
}

export const previewAnnotations: StorybookConfig['previewAnnotations'] = (entry = []) => {
  return [...entry, findDistEsm(__dirname, 'client/preview/config')];
};
