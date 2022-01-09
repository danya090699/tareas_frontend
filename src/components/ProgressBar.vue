<template>
    <div>
        <center><h2>{{ timeToStr(currentTime) }} / {{ timeToStr(duration) }}</h2></center>
        <v-progress-linear height="10" :value="currentTime / duration * 100" striped color="lime"/>
    </div>
</template>

<script>
export default {
    props: ["currentTime", "duration"],
    methods: {
        timeToStr(seconds) {
            seconds = Math.floor(seconds);
            let minutes = (seconds - seconds % 60) / 60;
            seconds = seconds % 60;
            return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        },
    }
}
</script>