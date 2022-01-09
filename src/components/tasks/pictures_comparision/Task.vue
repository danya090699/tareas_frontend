<template>
    <Shell ref="shell" :data="[task]" class="pa-2">
        <template v-slot:default>
            <center>
                <h3 v-if="id">Редактировать задание {{ task.name }}</h3>
                <h3 v-else>Создать задание типа {{ type_name }}</h3>
            </center>

            <v-text-field v-model="new_name" label="Название"/>

            <span>{{ templates.task.prefix }}</span>
            <div style="width: 300px; display: inline-block" class="mx-2">
                <v-text-field v-model="new_text" dense hide-details/>
            </div>
            <span>{{ templates.task.suffix }}</span>

            <br><br>
            <ul>
                <li>{{ templates.points[0] }}</li>
                <li>{{ templates.points[1] }}</li>
                <li>
                    <span>{{ templates.points[2] }}</span>
                    <div style="width: 300px; display: inline-block" class="mx-2">
                        <v-text-field v-model="new_point3" dense hide-details/>
                    </div>
                </li>
                <li>
                    <span>{{ templates.points[3] }}</span>
                    <div style="width: 300px; display: inline-block" class="mx-2">
                        <v-text-field v-model="new_point4" dense hide-details/>
                    </div>
                </li>
            </ul>

            <v-file-input v-model="new_picture1" label="Картинка 1" @change="select_picture1"/>
            <center>
                <img v-show="picture1_src" :src="picture1_src" width="30%"/>
            </center>

            <v-file-input v-model="new_picture2" label="Картинка 2" @change="select_picture2"/>
            <center>
                <img v-show="picture2_src" :src="picture2_src" width="30%"/>
            </center>

            <center>
                <v-btn v-if="id" v-show="all_text_fields_filled" @click="save">сохранить изменения</v-btn>
                <v-btn v-else v-show="all_text_fields_filled && picture1_src && picture2_src" @click="create">создать задание</v-btn>
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
                    this.new_text = task.other_info.text;
                    this.new_point3 = task.other_info.point3;
                    this.new_point4 = task.other_info.point4;
                    this.picture1_src = task.files.picture1;
                    this.picture2_src = task.files.picture2;
                }
            },
            immediate: true
        }
    },
    data: () => ({
        new_name: null,
        new_text: null,
        new_point3: null,
        new_point4: null,
        new_picture1: null,
        picture1_src: null,
        new_picture2: null,
        picture2_src: null,
        templates,
    }),
    computed: {
        task() {
            if (this.id) return this.store.get(["get_teacher_task", {id: this.id}]);
            else return {};
        },
        all_text_fields_filled() {
            let values = [this.new_name, this.new_text, this.new_point3, this.new_point4];
            return values.every((val) => val !== null && val.length > 0);
        }
    },
    methods: {
        select_picture1(file) {
            if (file) {
                let blob = new Blob([file]);
                this.picture1_src = URL.createObjectURL(blob);
            }
            else {
                if (this.id) this.picture1_src = this.task.files.picture1;
                else this.picture1_src = null;
            }
        },
        select_picture2(file) {
            if (file) {
                let blob = new Blob([file]);
                this.picture2_src = URL.createObjectURL(blob);
            }
            else {
                if (this.id) this.picture2_src = this.task.files.picture2;
                else this.picture2_src = null;
            }
        },
        save() {
            let files = [];
            let toServer = [
                "update_task",
                {
                    id: this.id,
                    name: this.new_name,
                    files: {},
                    other_info: {
                        text: this.new_text,
                        point3: this.new_point3,
                        point4: this.new_point4,
                    }
                }
            ];
            if (this.new_picture1) {
                let file_id = uuidv4();
                toServer[1].files.picture1 = file_id;
                files.push({file: this.new_picture1, id: file_id});
            }
            if (this.new_picture2) {
                let file_id = uuidv4();
                toServer[1].files.picture2 = file_id;
                files.push({file: this.new_picture2, id: file_id});
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
            let file1_id = uuidv4();
            let file2_id = uuidv4();
            this.$refs.shell.query({
                confirm: "Создать задание?",
                files: [
                    {file: this.new_picture1, id: file1_id},
                    {file: this.new_picture2, id: file2_id}
                ],
                toServer: [
                    "create_task",
                    {
                        type_id: this.type_id,
                        name: this.new_name,
                        files: {
                            picture1: file1_id,
                            picture2: file2_id
                        },
                        other_info: {
                            text: this.new_text,
                            point3: this.new_point3,
                            point4: this.new_point4
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