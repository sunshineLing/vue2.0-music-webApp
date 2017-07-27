<template>
    <div class="search-box">
        <i class="icon-search"></i>
        <input type="text" class="box" :placeholder="placeholder" v-model="query" ref="query">
        <i class="icon-dismiss" v-show="query" @click="clear"></i>
    </div>
</template>

<script type="text/ecmascript-6">
    import {debounce} from '../../common/js/uitl.js'

    export default {
        props: {
            placeholder: {
                type: String,
                default: '搜索歌曲、歌手'
            }
        },
        data () {
            return {
                query: ''
            }
        },
        created () {
            // 监控query的值，有新值就派发出去
            this.$watch('query', debounce((newQuery) => {
                this.$emit('query', newQuery)
            }, 200))
        },
        methods: {
            // 点击搜素清空按钮，把搜索内容清空
            clear () {
                this.query = ''
            },
            // 设置query的方法
            setQuery (query) {
                this.query = query
            },
            // 输入框的blur方法
            blur () {
                this.$refs.query.blur()
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'

    .search-box
        display: flex
        align-items: center
        box-sizing: border-box
        width: 100%
        padding: 0 6px
        height: 40px
        background: $color-highlight-background
        border-radius: 6px
        .icon-search
            font-size: 24px
            color: $color-background
        .box
            flex: 1
            margin: 0 5px
            line-height: 18px
            background: $color-highlight-background
            color: $color-text
            font-size: $font-size-medium
            &::placeholder
                color: $color-text-d
        .icon-dismiss
            font-size: 16px
            color: $color-background
</style>
