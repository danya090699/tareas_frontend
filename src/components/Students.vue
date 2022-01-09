<template>
    <Shell ref="shell" :data="[students]" class="pa-2">
        <template v-slot:default>
            <template v-if="students.students.length">
                <center class="font-weight-bold my-2">Зарегистрировавшиеся ученики</center>
                <v-simple-table>
                    <thead>
                    <tr>
                        <th>Имя</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="student in students.students">
                        <td @click="show_student(student.id)">{{ student.name }}</td>
                    </tr>
                    </tbody>
                </v-simple-table>
            </template>

            <div class="d-flex align-center">
                <v-btn @click="create_user(student_name, true)" class="mr-2" color="info" small>создать ученика</v-btn>
                <v-text-field v-model="student_name" placeholder="Имя ученика"/>
            </div>
            <div v-if="is_admin" class="d-flex align-center">
                <v-btn @click="create_user(teacher_name, false)" class="mr-2" color="info" small>создать учителя</v-btn>
                <v-text-field v-model="teacher_name" placeholder="Имя учителя"/>
            </div>

            <template v-if="students.not_registered.length">
                <center class="font-weight-bold my-2">Незарегистрировавшиеся пользователи</center>
                <v-simple-table>
                    <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Тип</th>
                        <th>Ссылка для регистрации</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="user in students.not_registered">
                        <td>{{ user.name }}</td>
                        <td>{{ user.is_student ? "ученик" : "учитель" }}</td>
                        <td>
                            <v-btn @click="to_clipboard(user.url)" small outlined color="grey">скопировать</v-btn>
                        </td>
                    </tr>
                    </tbody>
                </v-simple-table>
            </template>
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
            console.log(this.store.get(["get_students", {}]))
            return this.store.get(["get_students", {}])
        }
    },
    methods: {
        create_user(name, is_student) {
            this.$refs.shell.query({
                confirm: `Создать ${is_student ? "ученика" : "учителя"} ${name}?`,
                toServer: ["create_user", {name, is_student}],
                waiting: `Создание ${is_student ? "ученика" : "учителя"} ${name}`,
                accepted: (data) => {
                    console.log(data)
                    this.store.load(["get_students", {}])
                    return `${is_student ? "Ученик" : "Учитель"} ${name} создан`;
                },
                rejected: (message) => {
                    console.log(message)
                    return `Произошла ошибка при создании ${is_student ? "ученика" : "учителя"} ${name}: ${message}`;
                }
            })
        },
        to_clipboard(text) {
            navigator.clipboard.writeText(text);
        },
        show_student(id) {
            this.addScreen({type: "StudentTasks", info: {student_id: id}});
        }
    }
}
</script>
