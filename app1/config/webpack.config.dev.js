'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const ext = require('extract-text-webpack-plugin');
const paths = require('./paths');
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1',
];
const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const cssFilename = 'css/[name]-[contenthash:8].css';
module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    'polyfiles':require.resolve('./polyfills'),
    'reactDevUtils':require.resolve('react-dev-utils/webpackHotDevClient'),
    'index':paths.appIndexJs,
    'vendor':['axios']
  },
  output: {
    pathinfo: true,
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[name].chunk.js',
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
      //引入自定义 js
      /* jquery$: path.resolve(__dirname,'src/js/xxx.js') */
    },
    plugins: [
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
              
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            use:[
              {
                loader:'url-loader',
                options:{
                  limit: 10,
                  outputPath:'static/images/',
                  publicPath:'/'
                }
              },
              {
                loader:'img-loader',
                options:{
                  pngquant:{
                    quality: 80
                  }
                }
              }
            ]
          },
          {
            test: /\.(js|jsx|mjs)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: true,
            },
          },
          {
            test: /\.(css|less|sass|pcss)$/,
            use:ext.extract(
              {
                fallback: 'style-loader',
                use: [
                  {
                    loader:'css-loader',
                    options:{
                      //后续是否还有loader
                      importLoaders: 1,
                      //模块化
                      modules: true,
                      //className
                      localIdentName:'[path][name]-[local]-[hash:base64:5]',
                      //压缩
                      minimize:true,
                    },
                  },
                  {
                    loader:'postcss-loader',
                    options:{
                      plugins:[
                        require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS }),
                        require('postcss-cssnext')({
                          warnForDuplicates:false
                        }),
                        require('precss')(),
                      ],
                      modules: true,
                    }
                  }
                ]
              }
            ),
            exclude: [/node_modules/]
          },
          {
            test: /\.(css|less|sass|pcss)$/,
            use:ext.extract(
              {
                fallback: 'style-loader',
                use: [
                  {
                    loader:'css-loader',
                    options:{
                      //后续是否还有loader
                      importLoaders: 1,
                      //模块化
                      //modules: true,
                      //className
                      //localIdentName:'[path][name]-[local]-[hash:base64:5]',
                      //压缩
                      minimize:true,
                    },
                  },
                  {
                    loader:'postcss-loader',
                    options:{
                      plugins:[
                        require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS }),
                        require('postcss-cssnext')({
                          warnForDuplicates:false
                        }),
                        require('precss')(),
                      ],
                      modules: true,
                    }
                  }
                ]
              }
            ),
            exclude: [/src/]
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: '/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new InterpolateHtmlPlugin(env.raw),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    //js tree shaking
    new webpack.optimize.UglifyJsPlugin(),
    //css tree shaking
    // new purifyCss({
    //   paths:glob.sync([
    //     path.join(__dirname,'./public/*.html'),
    //     path.join(__dirname,'./src/*.js')
    //   ])
    // }),
    //单体分割单独分割引入css
    new ext({
      filename:cssFilename,
      allChunks: true
    }),

    //打包公共代码
    new webpack.optimize.CommonsChunkPlugin({
      name:'common',
      minChunks:2,
      chunks:['index']
    }),
    new webpack.ProvidePlugin({
      /**  注入自定义js
       * $:'jquery'
       */
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names:['vendor','manifest'],
      minChunks:Infinity,
    })
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  performance: {
    hints: false,
  },
};