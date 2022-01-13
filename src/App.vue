<template>
  <div id="app">
    <div>
      video_id : <input type="text" v-model="temp.video_id" /><br />
      loop : <input type="number"  v-model.number="temp.loop" /><br />
      <button @click="applyConfig">Apply</button>
      <button @click="playCurrentVideo">Play</button>
      <button @click="stopCurrentVideo">Stop</button>
      <button @click="pauseCurrentVideo">Pause</button>
    </div>
      <YoutubeVue3 ref="youtube" :videoid="play.video_id" :loop="play.loop" :width="480" :height="320"  
      @ended="onEnded" @paused="onPaused" @played="onPlayed"/>
    <br />
    <img alt="Vue logo" src="./assets/logo.png" width="25%" />
    <p>Hello Vue in CodeSandbox!</p>
    <video
      src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_30mb.mp4"
      poster
      width="360"
      preload="false"
      @canplay="send('SUCCESS')"
      @error="send('FAILED')"
      ref="videoElement"
    >
      <track kind="captions" />
    </video>
    <br />

    <button @click="send('PLAY')">Play</button>

    <button @click="send('PAUSE')">Pause</button>

    <button @click="send('RESET')">Reset</button>

    <button @click="send('END')">Stop</button>

    <button @click="getNewStateRemotely">Get new state remotely</button>
  </div>

<div id="counter">
sdfdsfds
  Counter: {{ counter }}
</div>

</template>



<script>
import { createMachine } from "xstate";
import { useMachine } from "@xstate/vue";
import { ref, inject } from "vue";

import { YoutubeVue3 } from 'youtube-vue3'

const machine = createMachine({
  id: "playerMachine",
  initial: "waiting",
  states: {
    waiting: {
      on: {
        SUCCESS: "ready",
        FAILED: "failed",
      },
    },
    failed: {},
    ready: {
      id: "readyMachine",
      initial: "ready",
      states: {
        ready: {
          on: {
            PLAY: {
              target: "playing",
              actions: ["playVideo"], //fire actions when the transition happen
            },
          },
        },
        playing: {
          on: {
            PAUSE: {
              target: "paused",
              actions: ["pauseVideo"],
            },
            RESET: {
              target: "playing",
              actions: ["resetVideo"],
            },
            END: {
              target: "ended",
              actions: ["stopVideo"],
            },
          },
        },
        paused: {
          on: {
            PLAY: {
              target: "playing",
              actions: ["playVideo"],
            },
            RESET: {
              target: "playing",
              actions: ["resetVideo"],
            },
            END: {
              target: "ended",
              actions: ["stopVideo"],
            },
          },
        },
        ended: {
          on: {
            RESET: {
              target: "playing",
              actions: ["resetVideo"],
            },
            PLAY: {
              target: "playing",
              actions: ["resetVideo"],
            },
          },
        },
      },
    },
  },
});

export default {
  methods: {
    applyConfig() {
      this.play = Object.assign(this.play, this.temp)
    },
    playCurrentVideo() {
      this.$refs.youtube.player.playVideo();
    },
    stopCurrentVideo() {
      this.$refs.youtube.player.stopVideo();
    },
    pauseCurrentVideo() {
      this.$refs.youtube.player.pauseVideo();
    },
    onEnded() {
      console.log("## OnEnded")
    },
    onPaused() {
      console.log("## OnPaused")
    },
    onPlayed() {
      console.log("## OnPlayed")
    }
  },
// https://renatello.com/vue-js-polling-using-setinterval/
   mounted() {
    this.polling = setInterval(() => {
      this.counter++
      this.getNewStateRemotely()
    }, 1000)
  },
  data() {
    return {
      counter: 0,
      temp: { video_id:"3P1CnWI62Ik", loop:1 },
      play : { video_id:"3P1CnWI62Ik", loop:1 }
    }
  },
  components: {
    YoutubeVue3
  },
  beforeUnmount () {
    clearInterval(this.polling)
  },
  setup() {
    const axios = inject('axios');

    const getNewStateRemotely = () => {
      axios
        .get('https://raw.githubusercontent.com/thibault-ketterer/vue-remote-control/main/newstate.json')
        .then(response => {
          console.log(response.data);
          send(response.data['newstate']);
        });
    };

    const videoElement = ref(null);
    const youtube = ref(null);
    const { state, send } = useMachine(machine, {
      //define the actions that will be triggered when buttons are click
      actions: {
        playVideo: () => {
          videoElement.value?.play();
          youtube.value?.player.playVideo();
        },
        pauseVideo: () => { 
          videoElement.value?.pause();
          youtube.value?.player.pauseVideo();
        },
        resetVideo: () => {
          videoElement.value.pause();
          videoElement.value.currentTime = 0;
          videoElement.value.play();
        },
        stopVideo: () => {
          videoElement.value.pause();
          videoElement.value.currentTime = videoElement.value.duration;
        },
      },
    });
    return {
      state,
      send,
      videoElement,
      youtube,
      getNewStateRemotely
    };
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
