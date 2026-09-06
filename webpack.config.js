const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (_, argv = {}) => ({
    target: 'web',
    mode: argv.mode || process.env.NODE_ENV || 'production',
    entry: {
      index: './src/index.js'
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      publicPath: '',
      clean: true
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/index.html', to: 'index.html' },
          { from: 'public/plugin.json', to: 'plugin.json' },
          { from: 'public/logo.png', to: 'logo.png' },
          { from: 'public/donate/alipay.png', to: 'donate/alipay.png' },
          { from: 'public/donate/alipay-light.png', to: 'donate/alipay-light.png' },
          { from: 'public/donate/wechat-pay.png', to: 'donate/wechat-pay.png' },
          { from: 'public/donate/wechat-pay-light.png', to: 'donate/wechat-pay-light.png' },
          { from: 'bridge/preload.js', to: 'preload.js', info: { minimized: true } },
          {
            from: 'node_modules/iconv-lite',
            to: 'node_modules/iconv-lite',
            globOptions: { ignore: ['**/README.md', '**/*.d.ts', '**/types/**'] }
          },
          {
            from: 'node_modules/safer-buffer',
            to: 'node_modules/safer-buffer',
            globOptions: { ignore: ['**/*.md', '**/tests.js'] }
          }
        ]
      })
    ],
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { targets: { chrome: '108' }, modules: false }],
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        },
        {
          test: /\.(less|css)$/,
          use: ['style-loader', { loader: 'css-loader', options: { url: false } }, 'less-loader']
        },
        {
          test: /\.wasm$/,
          type: 'asset/resource'
        }
      ]
    }
})
