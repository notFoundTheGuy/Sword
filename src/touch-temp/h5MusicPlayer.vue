<template>
    <div>
        <audio ref="audio" autoplay="autoplay" loop="loop">
            <source src="./assets/demo.mp3" type="audio/mpeg" autoplay="autoplay" />
        </audio>
        <div ref="container" class="container">
            <img src="./assets/music.png" ref="musicIcon" class="music" @click="musicControl">
        </div>
    </div>
</template>
<script>
// 兼容部分浏览器无法自动播放问题
var isFirstLoaded = true
var audio;
window.onload = function() {
    document.querySelector('body').addEventListener('touchend', function() {
        if(isFirstLoaded) {
            audio = document.querySelector('#audio')
            audio.load()
            audio.play()
            audio.loop
            isFirstLoaded = false
        }
    })
}
export default {
    name: 'mplayer',
    props: {
        src: ''
    },
    data() {
        return {
            musicRunning: true
        }
    },
    mounted() {
        this.music()
        this.$refs.musicIcon.classList.add('animate')
    },
    methods: {
        music: function () {
            let audio = this.$refs.audio
            audio.play();
            audio.loop;
            document.addEventListener("WeixinJSBridgeReady", function(){
                audio.play();
                audio.loop;
            });
        },
        musicControl: function () {
            if (this.musicRunning) {
                this.$refs.audio.pause()
                this.pause()
                this.$refs.musicIcon.classList.remove('animate')
            }else {
                this.$refs.audio.play()
                this.$refs.musicIcon.classList.add('animate')
            }
            this.musicRunning = !this.musicRunning
        },
        // 处理iOS音乐图标旋转问题
        pause: function () {
            let iTransform = getComputedStyle(this.$refs.musicIcon).transform;
            let cTransform = getComputedStyle(this.$refs.container).transform;
            this.$refs.container.style.transform = cTransform === 'none'
                ? iTransform
                : iTransform.concat(' ', cTransform);
        },
    }
}
</script>
<style lang="less" scoped>
.container {
    width: 100%;
    height: 100%;
    z-index: 999;
    background: none;
    .music {
        width: 100%;
        height: 100%;
    }
}
.animate {
    animation: music 1.8s linear infinite;
}
.musicPasued {
    animation-play-state: paused;
}
.musicRunning {
    animation-play-state: running;
}
@keyframes music {
    0% {}
    100% {
            transform: rotate(360deg)
    }
}
</style>