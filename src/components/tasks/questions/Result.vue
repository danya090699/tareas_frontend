<template>
    <Shell :data="[student_task, teacher_task]" class="px-4">
        <template v-slot:default>
            <CheckedButton v-if="student_id !== undefined"
                       :task_id="task_id"
                       :student_id="student_id"
                       :checked="student_task.checked"/>
            <center class="ma-4">
                <audio :src="student_task.files.audio" controls/>
                <h2>{{ teacher_task.other_info.header }}</h2>
                <img :src="teacher_task.files.picture" width="50%"/>
            </center>
            <h2>{{ templates.task.prefix }} {{ teacher_task.other_info.text }} {{ templates.task.suffix }}</h2>
            <ol class="my-2" style="font-size: 25px">
                <li v-for="point in teacher_task.other_info.points">{{ point }}</li>
            </ol>
        </template>
    </Shell>
</template>

<script>
import templates from "./templates.js";
import CheckedButton from "../../CheckedButton";

export default {
    props: ["task_id", "student_id"],
    components: { CheckedButton },
    data: () => ({
        templates
    }),
    computed: {
        student_task() {
            return this.store.get(["get_student_task", {task_id: this.task_id, student_id: this.student_id}]);
        },
        teacher_task() {
            return this.store.get(["get_teacher_task", {id: this.task_id}]);
        }
    }
}
</script>