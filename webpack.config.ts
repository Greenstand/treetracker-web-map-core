import { resolve, join } from 'path'
import { Configuration as WebpackConfiguration } from 'webpack'
import 'webpack-dev-server'

interface Configuration extends WebpackConfiguration {
  devServer?: any
}

const config: Configuration = {
  entry: './src/index.ts',
  devServer: {
    static: {
      directory: join(__dirname, 'dist'),
    },
    compress: true,
    port: 5000,
  },
  output: {
    library: { name: 'greenstand', type: 'umd' },
    filename: 'main.js',
    path: resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|svg)$/i,
        type: 'asset',
      },
    ],
  },
}

export default config
