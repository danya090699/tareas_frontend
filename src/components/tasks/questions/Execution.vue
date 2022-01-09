<template>
    <div class="pa-4">
        <Shell v-if="state == 'preparing'" :data="[task]" class="pa-2">
            <template v-slot:default>
                <center><v-btn @click="read">начать выполнение</v-btn></center>
            </template>
        </Shell>
        <template v-else-if="state == 'reading' || state == 'recording'">
            <Microphone v-if="state == 'recording'"/>
            <ProgressBar :currentTime="currentTime" :duration="duration"/>

            <center class="mt-3">
                <h2>{{ header }}</h2>
                <img :src="picture_src" width="40%"/>
            </center>
            <h2>{{ templates.task.prefix }} {{ text }} {{ templates.task.suffix }}</h2>

            <template v-if="state == 'reading'">
                <ol class="my-2" style="font-size: 25px">
                    <li v-for="point in points">{{ point }}</li>
                </ol>
                <h2>You have 20 seconds to ask each question</h2>
                <center class="mt-2">
                    <v-btn @click="record">начать запись</v-btn>
                </center>
            </template>
            <center v-else>
                <h2 class="ma-4">{{ points[Math.floor(currentTime / 20)] }}</h2>
            </center>
        </template>
        <center v-else-if="state == 'countdown'">
            <h2>До начала записи {{ timeBeforeStart }} секунд</h2>
        </center>
        <Shell v-else ref="shell">
            <center>
                <h3 class="mb-4">Запись завершена, нажмите сохранить</h3>
                <v-btn @click="save">сохранить</v-btn>
            </center>
        </Shell>
    </div>
</template>

<script>
import {v4 as uuidv4} from "uuid";
import templates from "./templates.js";
import ProgressBar from "../../ProgressBar";
import Microphone from "../../Microphone";

export default {
    props: ["id"],
    components: { ProgressBar, Microphone },
    data: () => ({
        state: "preparing",
        stream: null,
        header: null,
        picture_src: null,
        text: null,
        points: null,
        file: null,
        duration: 0,
        currentTime: 0,
        timeBeforeStart: 0,
        templates,
    }),
    computed: {
        task() {
            return this.store.get(["get_teacher_task", {id: this.id}]);
        }
    },
    methods: {
        read() {
            navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                this.stream = stream;
                this.state = "reading";
                this.header = this.task.other_info.header;
                this.picture_src = this.task.files.picture;
                this.text = this.task.other_info.text;
                this.points = this.task.other_info.points;
                this.currentTime = 0;
                this.duration = 90;

                let start = new Date();
                let timer = setInterval(() => {
                    if (this.state == "reading") {
                        this.currentTime = (new Date() - start) / 1000;
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(timer);
                    if (this.state == "reading") {
                        this.record();
                    }
                }, this.duration * 1000);
            })
            .catch(err => console.log(err))
        },
        record() {
            this.state = "countdown";
            this.timeBeforeStart = 5;

            let timer = setInterval(() => {
                this.timeBeforeStart--;
                if (this.timeBeforeStart == 0) {
                    clearInterval(timer);

                    this.state = "recording";
                    this.currentTime = 0;
                    this.duration = 80;

                    this.mediaRecorder = new MediaRecorder(this.stream);
                    this.mediaRecorder.addEventListener("dataavailable", event => {
                        let blob = new Blob([event.data], {type: 'audio/wav'});
                        this.file = new File([blob], "name");
                        this.state = "done";
                    })
                    this.mediaRecorder.start();

                    let start = new Date();
                    let timer = setInterval(() => {
                        this.currentTime = (new Date() - start) / 1000;
                    }, 100);

                    setTimeout(() => {
                        clearInterval(timer);
                        if (this.state == "recording") {
                            this.mediaRecorder.stop();
                        }
                    }, this.duration * 1000);
                }
            }, 1000);
        },
        save() {
            let file_id = uuidv4();
            this.$refs.shell.query({
                files: [{file: this.file, id: file_id}],
                toServer: ["solve_task", {task_id: this.id, files: {audio: file_id}}],
                waiting: "Сохранение записи",
                accepted: () => {
                    this.store.load(["get_student_tasks", {}]);
                    return "Запись сохранена";
                },
                rejected(message) {
                    return `Произошла ошибка при сохранении записи: ${message}`;
                }
            })
        }
    }
}
</script>