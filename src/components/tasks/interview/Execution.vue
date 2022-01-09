<template>
    <div class="pa-3">
        <Shell v-if="state == 'preparing'" ref="shell" :data="[task]" class="pa-2">
            <template v-slot:default>
                <h4 class="mb-4">{{ templates.task }}</h4>
                <center><v-btn @click="record">начать выполнение</v-btn></center>
            </template>
        </Shell>
        <template v-else-if="state == 'recording'">
            <Microphone/>
            <ProgressBar :currentTime="currentTime" :duration="duration"/>
        </template>
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
import templates from "./templates.js"
import ProgressBar from "../../ProgressBar";
import Microphone from "../../Microphone";

export default {
    props: ["id"],
    components: { ProgressBar, Microphone },
    data: () => ({
        state: "preparing",
        file: null,
        duration: 0,
        currentTime: 0,
        templates,
    }),
    computed: {
        task() {
            return this.store.get(["get_teacher_task", {id: this.id}]);
        }
    },
    methods: {
        record() {
            navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                let mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.addEventListener("dataavailable", event => {
                    let blob = new Blob([event.data], {type: 'audio/wav'});
                    this.file = new File([blob], "name");
                    this.state = "done";
                })
                mediaRecorder.start();
                this.state = "recording";

                let audio = new Audio(this.task.files.audio);
                audio.addEventListener("ended", () => mediaRecorder.stop())
                audio.play();
                setInterval(() => {
                    if (!isNaN(audio.duration)) {
                        this.duration = audio.duration;
                    }
                    this.currentTime = audio.currentTime;
                }, 100)

            })
            .catch(err => console.log(err))
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