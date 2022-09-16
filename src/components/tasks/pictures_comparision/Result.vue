<template>
    <Shell :data="[student_task, teacher_task]" class="px-4">
        <template v-slot:default>
            <CheckedButton v-if="student_id !== undefined"
                       :task_id="task_id"
                       :student_id="student_id"
                       :checked="student_task.checked"/>
            <center class="ma-4">
                <audio :src="student_task.files.audio" controls/>
            </center>

            <h3 class="mt-4">{{ templates.task.prefix }}{{ teacher_task.other_info.text }}{{ templates.task.suffix }}</h3>
            <ul class="my-3" style="font-size: 20px">
                <li>{{ templates.points[0] }}</li>
                <li>{{ templates.points[1] }} {{ teacher_task.other_info.point3 }}</li>
                <li>{{ templates.points[2] }} {{ teacher_task.other_info.point3 }}</li>
                <li>{{ templates.points[3] }} {{ teacher_task.other_info.point4 }}</li>
            </ul>

            <div class="d-flex mt-5">
                <div style="width: 50%">
                    <center>
                        <h3>Photo 1</h3>
                        <img :src="teacher_task.files.picture1" width="90%"/>
                    </center>
                </div>
                <div style="width: 50%">
                    <center>
                        <h3>Photo 2</h3>
                        <img :src="teacher_task.files.picture2" width="90%"/>
                    </center>
                </div>
            </div>
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