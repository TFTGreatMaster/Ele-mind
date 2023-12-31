// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const path = require('path');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
  .default;
const styledComponentsTransformer = createStyledComponentsTransformer();
module.exports = {
  plugins: [
    // your custom plugins
  ],
  module: {
    rules: [
      // add your custom rules.
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.(scss|sass)$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules\//]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader?declaration=false',
            options: {
              declaration: false,
              getCustomTransformers: () => ({
                before: [styledComponentsTransformer]
              })
            }
          }
        ]
      },
      {
        test: /\.stories\.tsx?$/,
        loaders: [
          {
            loader: require.resolve('@storybook/source-loader'),
            options: { parser: 'typescript' }
          }
        ],
        enforce: 'pre'
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: ['file-loader']
      }
    ]
  },
  resolve: {
    alias: {
      '@ele-mind/core': path.join(__dirname, '../packages/core/src/index'),
      '@ele-mind/icons': path.join(__dirname, '../packages/icons/'),
      '@ele-mind/renderer-react': path.join(
        __dirname,
        '../packages/renderer-react/src/index'
      ),
      '@ele-mind/plugin-json-serializer': path.join(
        __dirname,
        '../packages/plugin-json-serializer/src/index'
      ),
      '@ele-mind/plugin-rich-text-editor': path.join(
        __dirname,
        '../packages/plugin-rich-text-editor/src/index'
      ),
      '@ele-mind/plugin-topology-diagram': path.join(
        __dirname,
        '../packages/plugin-topology-diagram/src/index'
      ),
      '@ele-mind/plugins': path.join(
        __dirname,
        '../packages/plugins/src/index'
      ),
      'styled-components': path.join(
        __dirname,
        '..',
        'node_modules',
        'styled-components'
      )
    },
    extensions: ['.tsx', '.ts', '.js']
  }
};
