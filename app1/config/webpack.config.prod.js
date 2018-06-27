'use strict';
var fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ext = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
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
const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name]-[contenthash:8].css';
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? 
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

module.exports = {
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: {
    'polyfiles':require.resolve('./polyfills'),
    'reactDevUtils':require.resolve('react-dev-utils/webpackHotDevClient'),
    'index':paths.appIndexJs,
    'vendor':['axios']
  },
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/')
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
              name: 'static/media/[name].[hash:8].[ext]',
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
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new webpack.DefinePlugin(env.stringified),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
      sourceMap: shouldUseSourceMap,
    }),
    new ext({
      filename: cssFilename,
      allChunks: true
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: publicUrl + '/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
};
