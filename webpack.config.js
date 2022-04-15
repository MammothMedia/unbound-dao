'use strict';

const path = require('path');
const { DefinePlugin } = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const isProduction = !!process.env.NODE_ENV;

const NODE_ENV = process.env.NODE_ENV || 'local';
const isLocal = process.env.FAST_TRACK || NODE_ENV === 'local';

const config = {
  mode: isLocal ? 'development' : 'production',
  devtool: isLocal ? 'eval-source-map' : 'source-map',
  entry: ['./app/index.js'],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env', '@babel/react'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import',
            ],
          },
        },
      },
      {
        test: /\.(gql)$/,
        exclude: /node_modules/,
        use: ['raw-loader'],
      },
      {
        test: /\.(png|jpe?g|svg|gif|mp4)$/i,
        use: ['file-loader'],
      },
      {
        //bootstrap loader
        test: /\.css$/,
        include: [/node_modules\/bootstrap/, /node_modules\/react-datepicker/],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        use: ['pug-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.styl'],
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: '[hash].[name].js',
  },
  plugins: [
    new ESLintPlugin({
      failOnError: false,
      failOnWarning: false,
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'app/static/index.pug',
      title: 'VTAGZ',
      favicon: 'app/static/favicon.png',
      isProduction: NODE_ENV === 'production',
    }),
    new MiniCssExtractPlugin({ filename: '[hash].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        // bundle infrequently updated and commonly used react modules
        reactVendors: {
          test: /[\\/]node_modules[\\/](react|react-router-dom|prop-types)/,
          priority: 0,
          reuseExistingChunk: true,
        },
        // bundle all other node_modules
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  devServer: {
    disableHostCheck: true,
    compress: true,
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    host: 'localhost',
    https: !!process.env.FAST_TRACK, // use https for fast tracking to stage
    port: 8080,
    public: 'local.vtagz.com:8080',
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    /*
    proxy: {
      '*': {
        target: 'http://localhost:3000',
        bypass: (req, res, proxyOptions) => {
          if (!req.headers.accept || req.headers.accept.indexOf('html') !== -1) {
              return '/index.html';
          } else if (req.method === 'GET' && isStatic.test(req.url)) {
              return `/${req.url}`;
          }
        }
      }
    }
    */
  },
};

config.plugins.push(
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  })
);

if (isProduction) {
  config.plugins.push(
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
      canPrint: true,
    })
  );
}
module.exports = config;
