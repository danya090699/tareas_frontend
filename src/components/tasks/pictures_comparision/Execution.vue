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

            <h2 class="mt-4">{{ templates.task.prefix }}{{ text }}{{ templates.task.suffix }}</h2>
            <ul class="my-3" style="font-size: 25px">
                <li>{{ templates.points[0] }}</li>
                <li>{{ templates.points[1] }}</li>
                <li>{{ templates.points[2] }} {{ point3 }}</li>
                <li>{{ templates.points[3] }} {{ point4 }}</li>
            </ul>
            <h2>You will speak for not more than 3 minutes (12-15 sentences). You have to talk continuously.</h2>

            <div class="d-flex mt-5">
                <div style="width: 50%">
                    <center>
                        <h3>Photo 1</h3>
                        <img :src="picture1_src" width="90%"/>
                    </center>
                </div>
                <div style="width: 50%">
                    <center>
                        <h3>Photo 2</h3>
                        <img :src="picture2_src" width="90%"/>
                    </center>
                </div>
            </div>

            <center class="mt-2">
                <v-btn v-if="state == 'recording'" @click="mediaRecorder.stop()">остановить запись</v-btn>
                <v-btn v-else @click="record">начать запись</v-btn>
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
        mediaRecorder: null,
        text: null,
        point3: null,
        point4: null,
        picture1_src: null,
        picture2_src: null,
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
                this.text = this.task.other_info.text;
                this.point3 = this.task.other_info.point3;
                this.point4 = this.task.other_info.point4;
                this.picture1_src = this.task.files.picture1;
                this.picture2_src = this.task.files.picture2;
                this.currentTime = 0;
                this.duration = 150;

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

            let countdownTimer = setInterval(() => {
                this.timeBeforeStart--;
                if (this.timeBeforeStart == 0) {
                    clearInterval(countdownTimer);

                    this.state = "recording";
                    this.currentTime = 0;
                    this.duration = 180;

                    this.mediaRecorder = new MediaRecorder(this.stream);
                    this.mediaRecorder.addEventListener("dataavailable", event => {
                        let blob = new Blob([event.data], {type: 'audio/wav'});
                        this.file = new File([blob], "name");
                        this.state = "done";
                    })
                    this.mediaRecorder.start();

                    let start = new Date();
                    let taskTimer = setInterval(() => {
                        this.currentTime = (new Date() - start) / 1000;
                    }, 100);

                    setTimeout(() => {
                        clearInterval(taskTimer);
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