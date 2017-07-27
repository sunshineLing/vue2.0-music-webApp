<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <!--手动监听进度条按钮的touchStart和touchMove事件,并阻止浏览器的默认行为-->
            <div class="progress-btn-wrapper" ref="progressBtn"
                @touchstart.prevent="progressTouchStart"
                @touchmove.prevent="progressTouchMove"
                @touchend.prevent="progressTouchEnd"
            >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import {prefixStyle} from '../../common/js/dom.js'

    const progressBtnWidth = 16 // 进度条按钮的宽度是16
    const transform = prefixStyle('transform')

    export default {
        props: {
            percent: {
                type: Number,
                default: 0
            }
        },
        created () {
            // 用于不同的touch状态时候数据共享，将数据都挂在钩子上
            this.touch = {}
        },
        methods: {
            // 可以从event对象里面拿到touch的相关信息
            progressTouchStart (e) {
                // 定义标志位，表示已经初始化了
                this.touch.initiated = true
                // 记录touch点击的位置，等于第一个手指触到的横向的坐标
                this.touch.startX = e.touches[0].pageX
                // 记录点击按钮的时候，当前按钮在整个进度条上已经偏移了多少位置
                this.touch.left = this.$refs.progress.clientWidth
            },
            progressTouchMove (e) {
                // 如果进入到move的时候，没有经过初始化的时候
                if (!this.touch.initiated) {
                    return
                }
                // 获取拖动进度条的距离
                const deltaX = e.touches[0].pageX - this.touch.startX
                // 计算拖动之后进度条偏移的总宽度，原来偏移的宽度+进度条拖动的宽度
                // 需要大于0
                let offsetWidth = Math.max(0, this.touch.left + deltaX)
                // 偏移的总长度不能大于进度条的总宽度
                offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, offsetWidth)

                // 跟新进度条和进度条按钮的位置
                // 设置进度条的宽度
                this.$refs.progress.style.width = `${offsetWidth}px`
                // 设置进度条拖动按钮的偏移位置
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
            },
            progressTouchEnd () {
                this.touch.initiated = false

                // 但是到这一步不能完全设置，因为拖动的过程中，歌曲还在播放，歌曲播放的时候，percent还是原来的长度，还没有改变，所以会跳回原来的位置，需要给percent设置新的位置，然后传值到父组件里面，修改当前的歌曲进度
                this._triggerPercent()
            },
            // 定义拖动时触发
            _triggerPercent () {
                // 获取总的进度条的宽度
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                // 当前进度条被拖动后的位置
                const progressWidth = this.$refs.progress.clientWidth
                // 计算当前的percent
                const percent = progressWidth / barWidth
                // 把percent传递给父组件
                this.$emit('percentChange', percent)
            },
            // 点击进度条时候，播放当前进度的歌曲
            progressClick (e) {
                // 点击进度条的时候，可以获取当前进度条被点击的偏移的位置
                // const offsetX = e.offsetX
                // console.log(offsetX)
                // 因为点击的时候，如果点击到的是progressBtn按钮上，会导致当前的e.offsetX获取的值不正确
                // 通过当前的PageX来获取，从屏幕左边到当前位置的距离，再减去左侧的位置
                const rect = this.$refs.progressBar.getBoundingClientRect()
                const offsetX = e.pageX - rect.left
                // 给进度条和进度条按钮设置这个偏移位置
                // 设置进度条的宽度
                this.$refs.progress.style.width = `${offsetX}px`
                // 设置进度条拖动按钮的偏移位置
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetX}px, 0, 0)`

                // 将当前的percent传递给父组件
                this._triggerPercent()
            }
        },
        watch: {
            // 进度percent是不断改变的
            percent (newPercent) {
                if (newPercent >= 0 && !this.touch.initiated) {
                    // 获取进度条总的宽度
                    const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                    // 进度条实时偏移的宽度,歌曲播放的比例 * 进度条的总宽度
                    const offsetWidth = newPercent * barWidth
                    // 设置进度条的宽度
                    this.$refs.progress.style.width = `${offsetWidth}px`
                    // 设置进度条拖动按钮的偏移位置
                    this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
                }
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'

    .progress-bar
        height: 30px
        .bar-inner
            position: relative
            top: 13px
            height: 4px
            background: rgba(0, 0, 0, 0.3)
            .progress
                position: absolute
                height: 100%
                background: $color-theme
            .progress-btn-wrapper   
                position: absolute
                left: -8px
                top: -13px
                width: 30px
                height: 30px
                .progress-btn
                    position: relative
                    top: 7px
                    left: 7px
                    box-sizing: border-box
                    width: 16px
                    height: 16px
                    border: 3px solid $color-text
                    border-radius: 50%
                    background: $color-theme
</style>