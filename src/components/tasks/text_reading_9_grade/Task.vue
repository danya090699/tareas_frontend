<template>
    <Shell ref="shell" :data="[task]" class="pa-2">
        <template v-slot:default>
            <center>
                <h3 v-if="id">Редактировать задание {{ task.name }}</h3>
                <h3 v-else>Создать задание типа {{ type_name }}</h3>
            </center>

            <v-text-field v-model="new_name" label="Название"/>

            <v-textarea v-model="new_text" label="Текст"/>

            <center v-show="new_name !== null && new_name.length > 0 && new_text !== null && new_text.length > 0">
                <v-btn v-if="id" @click="save">сохранить изменения</v-btn>
                <v-btn v-else @click="create">создать задание</v-btn>
            </center>
        </template>
    </Shell>
</template>

<script>

export default {
    props: ["id", "type_id", "type_name"],
    watch: {
        task: {
            handler: function(task) {
                if (this.id && this.isData(task) && this.new_name === null) {
                    this.new_name = task.name
                    this.new_text = task.other_info.text;
                }
            },
            immediate: true
        }
    },
    data: () => ({
        new_name: null,
        new_text: null,
    }),
    computed: {
        task() {
            if (this.id) return this.store.get(["get_teacher_task", {id: this.id}]);
            else return {};
        }
    },
    methods: {
        save() {
            this.$refs.shell.query({
                confirm: "Сохранить изменения?",
                toServer: ["update_task", {id: this.id, name: this.new_name, other_info: {text: this.new_text}}],
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
            this.$refs.shell.query({
                confirm: "Создать задание?",
                toServer: ["create_task", {type_id: this.type_id, name: this.new_name, other_info: {text: this.new_text}}],
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