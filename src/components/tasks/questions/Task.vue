<template>
    <Shell ref="shell" :data="[task]" class="pa-2">
        <template v-slot:default>
            <center>
                <h3 v-if="id">Редактировать задание {{ task.name }}</h3>
                <h3 v-else>Создать задание типа {{ type_name }}</h3>
            </center>

            <v-text-field v-model="new_name" label="Название"/>

            <v-text-field v-model="new_header" label="Заголовок"/>

            <v-file-input v-model="new_picture" label="Картинка" @change="select_picture"/>
            <center>
                <img v-show="picture_src" :src="picture_src" width="30%"/>
            </center>

            <span>{{ templates.task.prefix }}</span>
            <div style="width: 300px; display: inline-block" class="mx-2">
                <v-text-field v-model="new_text" dense hide-details/>
            </div>
            <span>{{ templates.task.suffix }}</span>

            <br><br>
            <v-text-field v-for="i in 4" v-model="new_points[i - 1]" :label="'Пункт ' + i"/>

            <center>
                <v-btn v-if="id" v-show="all_text_fields_filled" @click="save">сохранить изменения</v-btn>
                <v-btn v-else v-show="all_text_fields_filled && picture_src" @click="create">создать задание</v-btn>
            </center>
        </template>
    </Shell>
</template>

<script>
import templates from "./templates.js";
import { v4 as uuidv4 } from 'uuid';

export default {
    props: ["id", "type_id", "type_name"],
    watch: {
        task: {
            handler: function(task) {
                if (this.id && this.isData(task) && this.new_name === null) {
                    this.new_name = task.name;
                    this.new_header = task.other_info.header;
                    this.picture_src = task.files.picture;
                    this.new_text = task.other_info.text;
                    this.new_points = task.other_info.points;
                }
            },
            immediate: true
        }
    },
    data: () => ({
        new_name: null,
        new_header: null,
        new_picture: null,
        picture_src: null,
        new_text: null,
        new_points: [null, null, null, null],
        templates,
    }),
    computed: {
        task() {
            if (this.id) return this.store.get(["get_teacher_task", {id: this.id}]);
            else return {};
        },
        all_text_fields_filled() {
            let values = [...this.new_points, ...[this.new_name, this.new_header, this.new_text]];
            return values.every((val) => val !== null && val.length > 0);
        }
    },
    methods: {
        select_picture(file) {
            if (file) {
                let blob = new Blob([file]);
                this.picture_src = URL.createObjectURL(blob);
            }
            else {
                if (this.id) this.picture_src = this.task.files.picture;
                else this.picture_src = null;
            }
        },
        save() {
            let files = [];
            let toServer = [
                "update_task",
                {
                    id: this.id,
                    name: this.new_name,
                    other_info: {
                        header: this.new_header,
                        text: this.new_text,
                        points: this.new_points,
                    }
                }
            ];
            if (this.new_picture) {
                let file_id = uuidv4();
                toServer[1].files = {picture: file_id};
                files.push({file: this.new_picture, id: file_id})
            }
            let file_id = uuidv4();
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
                files: [{file: this.new_picture, id: file_id}],
                toServer: [
                    "create_task",
                    {
                        type_id: this.type_id,
                        name: this.new_name,
                        files: {picture: file_id},
                        other_info: {
                            header: this.new_header,
                            text: this.new_text,
                            points: this.new_points,
                        }
                    }
                ],
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