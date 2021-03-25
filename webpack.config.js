const path = require('path');
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        pollyfill: './src/pollyfill.js',
        index: './src/index.ts',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test:/\.css$/,
                use:[
                    {
                        loader:miniCssExtractPlugin.loader,
                        options:{
                            publicPath:'../'
                        }
                    },
                    // 'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            // {
            //     // * 处理html中的图片资源
            //     test:/\.html/,
            //     loader:'html-loader'
            // },
            {
                test:/\.(jpg|jpeg|png|gif)$/,
                use:[
                    'url-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].bundle.js'
    },



//   cacheGroups
//   `cacheGroups`是`splitChunks`配置的核心，对代码的拆分规则全在`cacheGroups`缓存组里配置。
//   缓存组的每一个属性都是一个配置规则，我这里给他的`default`属性进行了配置，属性名可以不叫default可以自己定。
//   属性的值是一个对象，里面放的我们对一个代码拆分规则的描述。


    optimization: {
        splitChunks: {
            minSize: 30,  // 最小30字节，小于30字节不会被提取出来，提取出的chunk的最小大小 这个属性可以在每个缓存组属性中设置，也可以在splitChunks属性中设置，这样在每个缓存组都会继承这个配置。
            cacheGroups: {
                default: {
                    name: 'common',
                    //   - name
                    // 提取出来的公共模块将会以这个来命名，可以不配置，如果不配置，就会生成默认的文件名，大致格式是`index～a.js`这样的。
                    chunks: 'initial',
                    // - chunks
                    // 指定哪些类型的chunk参与拆分，值可以是string可以是函数。
                    // 如果是string，可以是这个三个值之一：`all`, `async`, `initial`，`all`代表所有模块，`async`代表只管异步加载的, `initial`代表初始化时就能获取的模块。
                    // 如果是函数，则可以根据chunk参数的name等属性进行更细致的筛选。
                    minChunks: 2,  //模块被引用2次以上的才抽离
                    priority: -20
                },
                // 拆分第三方库（通过npm|yarn安装的库）vendors可以自己命名
                vendors: {
                    test: /[\\/]node_modules[\\/]/, // test的值可以是一个正则表达式，也可以是一个函数。 用于选择绝对路径下的文件
                    name: 'vendor',
                    chunks: 'async',
                    priority: -10
                    // priority 当缓存组中设置有多个拆分规则，而某个模块同时符合好几个规则的时候，则需要通过优先级属性priority来决定使用哪个拆分规则。
                    // 这样当一个第三方库被引用超过2次的时候，就不会打包到业务模块里了。
                },

                //专门打包某一文件,问题所在，无法将locallib单独拆出来需要解决!!!!!!
                // locallib: {  //拆分指定文件
                //     test: /(src\/locallib\.js)$/,
                //     name: 'locallib',
                //     chunks: 'initial',
                //     priority: -9  // -9 比-10优先纪别低
                // }
            }
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'public/index.html'
        })
    ],
    devServer: {
        contentBase:path.resolve(__dirname,'dist'),
        //host:'192.168.191.2',
        //port:8080,
        compress:true,
        historyApiFallback:true
    }
};
