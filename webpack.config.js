const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    entry: './src/renderer/index.tsx',
    target: 'web',
    devtool: isDev ? 'inline-source-map' : 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'src/renderer'),
      },
      port: 3000,
      hot: true,
      liveReload: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
              transpileOnly: isDev,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@renderer': path.resolve(__dirname, 'src/renderer'),
        '@main': path.resolve(__dirname, 'src/main'),
      },
    },
    output: {
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'dist/renderer'),
      publicPath: isDev ? '/' : '',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html',
        filename: 'index.html',
      }),
    ],
  };
};
