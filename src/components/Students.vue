<template>
    <Shell ref="shell" :data="[students]" class="pa-2">
        <template v-slot:default>
            <v-simple-table v-show="students.length">
                <thead>
                <tr>
                    <th>Имя</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="student in students">
                    <td @click="show_student(student.id)">{{ student.name }}</td>
                </tr>
                </tbody>
            </v-simple-table>

            <div class="d-flex align-center">
                <v-btn @click="create_user(student_name, true)" class="mr-2" color="info" small>создать ученика</v-btn>
                <v-text-field v-model="student_name" placeholder="Имя ученика"/>
            </div>
            <div v-if="is_admin" class="d-flex align-center">
                <v-btn @click="create_user(teacher_name, false)" class="mr-2" color="info" small>создать учителя</v-btn>
                <v-text-field v-model="teacher_name" placeholder="Имя учителя"/>
            </div>
        </template>
    </Shell>
</template>

<script>
export default {
    inject: ["addScreen"],
    props: ["is_admin"],
    data: () => ({
        student_name: "",
        teacher_name: ""
    }),
    computed: {
        students() {
            return this.store.get(["get_students", {}])
        }
    },
    methods: {
        create_user(name, is_student) {
            this.$refs.shell.query({
                toServer: ["create_user", {name, is_student}],
                waiting: `Создание ссылки для ${is_student ? "ученика" : "учителя"} ${name}`,
                accepted: (url) => {
                    navigator.clipboard.writeText(url);
                    return `Ссылка скопирована в буфер`;
                },
                rejected: (message) => {
                    return `Произошла ошибка при создании ссылки для ${is_student ? "ученика" : "учителя"} ${name}: ${message}`;
                }
            })
        },
        show_student(id) {
            this.addScreen({type: "StudentTasks", info: {student_id: id}});
        }
    }
}
</script>
