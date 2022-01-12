<template>
  <div id="app">
avnat YT
    <youtube :video-id="videoId" :player-vars="playerVars" @playing="playing"></youtube>
apres YT
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
    playing() {
      console.log('\\o/ we are watching!!!')
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
      videoId: 'lG0Ys-2d4MA',
      playerVars: {
        autoplay: 1
      }
    }
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
    const { state, send } = useMachine(machine, {
      //define the actions that will be triggered when buttons are click
      actions: {
        playVideo: () => videoElement.value?.play(),
        pauseVideo: () => videoElement.value?.pause(),
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
