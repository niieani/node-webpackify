module.exports = {
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ]
      }
    ],
  },
}
