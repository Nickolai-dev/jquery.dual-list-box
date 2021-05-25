const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = (env) => {
  return {
    entry: '!!uglify-loader!./src/js/jquery.dual-list-box.js',
    output: {
      filename: 'js/jquery.dual-list-box.min.js',
      path: path.resolve(__dirname, 'dist'),
    },
    cache: false,
    resolve: {
      fallback: {
        'fs': false,
        'path': false,
      }, alias: {
        //src: path.resolve(__dirname, 'src'),
      }
    }, plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, 'src/index.html'),
        inject: 'head',
        scriptLoading: 'blocking',
        minify: false
      }),
    ],
    module: {
      rules: [{
        test: /\.s[ac]ss$/i,
        use:[{
          loader: 'file-loader',
          options: {
            name: 'css/[name].css'
          }
        }, 'postcss-loader', 'sass-loader']
      }, {
        test: /\.html$/i,
        use: [{
          loader: 'html-loader',
          options: {
            esModule: false,
            minimize: false
          }
        }]
      }, {
        test: /jquery.min.js$/,
        loader: 'file-loader',
        options: {
          emitFile: false,
          name: '../[path]jquery.min.js'
        }
      }]
    }
  }
}
