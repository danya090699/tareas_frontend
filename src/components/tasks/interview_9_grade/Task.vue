<template>
    <Shell ref="shell" :data="[task]" class="pa-2">
        <template v-slot:default>
            <center>
                <h3 v-if="id">Редактировать задание {{ task.name }}</h3>
                <h3 v-else>Создать задание типа {{ type_name }}</h3>
            </center>

            <v-text-field v-model="new_name" label="Название"/>

            <v-file-input v-model="new_audio" label="Аудиозапись" @change="select_audio"/>
            <audio v-show="audio_src" :src="audio_src" controls/>

            <template v-if="id">
                <center v-show="new_name !== null && new_name.length > 0">
                    <v-btn @click="save">сохранить изменения</v-btn>
                </center>
            </template>
            <template v-else>
                <center v-show="new_audio && new_name !== null && new_name.length > 0">
                    <v-btn @click="create">создать задание</v-btn>
                </center>
            </template>
        </template>
    </Shell>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
    props: ["id", "type_id", "type_name"],
    watch: {
        task: {
            handler: function(task) {
                if (this.id && this.isData(task) && this.audio_src === null) {
                    this.new_name = task.name
                    this.audio_src = task.files.audio;
                }
            },
            immediate: true
        }
    },
    data: () => ({
        new_name: null,
        new_audio: null,
        audio_src: null
    }),
    computed: {
        task() {
            if (this.id) return this.store.get(["get_teacher_task", {id: this.id}]);
            else return {};
        }
    },
    methods: {
        select_audio(file) {
            if (file) {
                let blob = new Blob([file]);
                this.audio_src = URL.createObjectURL(blob);
            }
            else {

                if (this.id) this.audio_src = this.task.files.audio;
                else this.audio_src = null;
            }
        },
        save() {
            let files = [];
            let toServer = ["update_task", {id: this.id, name: this.new_name}]
            if (this.new_audio) {
                let file_id = uuidv4();
                toServer[1].files = {audio: file_id};
                files.push({file: this.new_audio, id: file_id})
            }

            this.$refs.shell.query({
                confirm: "Сохранить изменения?",
                files,
                toServer,
                waiting: "Сохранение изменений",
                accepted: () => {
                    this.store.load(["get_teacher_task", {id: this.id}]);
                    this.store.load(["get_teacher_tasks", {}]);
                    return "Изменения сохранены";
                },
                rejected(message) {
                    return `Произошла ошибка при сохранении изменений: ${message}`;
                }
            })
        },
        create() {
            let file_id = uuidv4();
            this.$refs.shell.query({
                confirm: "Создать задание?",
                files: [{file: this.new_audio, id: file_id}],
                toServer: ["create_task", {type_id: this.type_id, name: this.new_name, files: {audio: file_id}}],
                waiting: "Создание задания",
                accepted: () => {
                    this.store.load(["get_teacher_tasks", {}]);
                    return "Задание создано";
                },
                rejected(message) {
                    return `Произошла ошибка при создании задания: ${message}`;
                }
            })
        }
    }
}
</script>