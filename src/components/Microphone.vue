<template>
    <center><v-icon x-large :style="{visibility: visibility}">mdi-microphone</v-icon></center>
</template>

<script>
export default {
    data() {
        setTimeout(this.change_display, 500);
        return {
            visibility: "visible"
        }
    },
    methods: {
        change_display() {
            this.visibility = (this.visibility == "visible") ? "hidden" : "visible";
            setTimeout(this.change_display, 500);
        }
    }
}
</script>