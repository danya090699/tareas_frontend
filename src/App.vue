<template>
    <div ref="window" v-resize="windowResize" style="height: 100%; overflow: hidden">
        <v-app style="background-color: transparent">
            <div :style="{height: windowHeight+'px'}">

    
                <Authorization v-if="!store.authorized" v-model="store.authorized"
                               :url="config.url" :service="services.auth" :nameappl="config.name"
                />

                <Shell :data="[user_info]" style="height: 100%; display: flex; flex-direction: column">
                    <template v-slot:default>
                        <v-app-bar color="indigo" dense class="flex-grow-0">
                            <v-btn v-show="screens.length" icon dark @click="goBack"><v-icon>mdi-chevron-left</v-icon></v-btn>
                            <v-spacer/>
                            <div class="white--text">{{ user_info.name }}</div>
                            <v-spacer/>
                            <v-btn icon dark @click="logout"><v-icon>mdi-logout</v-icon></v-btn>
                        </v-app-bar>

                        <div class="flex-grow-1 pb-10" style="overflow: auto">

                            <div v-show="screens.length == 0">
                                <template v-if="user_info.type == 'teacher'">

                                    <v-tabs v-model="tab" background-color="transparent" color="blue" grow>
                                        <v-tab key="tasks">Задания</v-tab>
                                        <v-tab key="students">Ученики</v-tab>
                                    </v-tabs>
                                    <v-tabs-items v-model="tab">
                                        <v-tab-item key="tasks">
                                            <AllTasksForTeacher/>
                                        </v-tab-item>
                                        <v-tab-item key="students">
                                            <StudentsForTeacher :is_admin="user_info.is_admin"/>
                                        </v-tab-item>
                                    </v-tabs-items>

                                </template>
                                <TasksForStudent v-else/>
                            </div>

                            <component
                                v-for="(screen, i) in screens"
                                v-show="i == screens.length - 1"
                                :is="screen.type"
                                v-bind="screen.info"
                            />

                        </div>
                    </template>
                </Shell>
            </div>
        </v-app>
    </div>
</template>


<script>
import {AuthReg as Authorization} from 'dmfApplLib'

import TasksForStudent from "./components/students/Tasks";

import AllTasksForTeacher from "./components/teachers/AllTasks";
import StudentsForTeacher from "./components/teachers/Students";
import StudentTasksForTeacher from "./components/teachers/StudentTasks";

import InterviewTask from "./components/tasks/interview/Task";
import InterviewExecution from "./components/tasks/interview/Execution";
import InterviewResult from "./components/tasks/interview/Result";

import TextReadingTask from "./components/tasks/text_reading/Task";
import TextReadingExecution from "./components/tasks/text_reading/Execution";
import TextReadingResult from "./components/tasks/text_reading/Result";

import QuestionsTask from "./components/tasks/questions/Task";
import QuestionsExecution from "./components/tasks/questions/Execution";
import QuestionsResult from "./components/tasks/questions/Result";

import PicturesComparisionTask from "./components/tasks/pictures_comparision/Task";
import PicturesComparisionExecution from "./components/tasks/pictures_comparision/Execution";
import PicturesComparisionResult from "./components/tasks/pictures_comparision/Result";

import Monologue9GradeTask from "./components/tasks/monologue_9_grade/Task";
import Monologue9GradeExecution from "./components/tasks/monologue_9_grade/Execution";
import Monologue9GradeResult from "./components/tasks/monologue_9_grade/Result";

export default {
    components: {
        Authorization,
        TasksForStudent,
        AllTasksForTeacher, StudentsForTeacher, StudentTasksForTeacher,
        InterviewTask, InterviewExecution, InterviewResult,
        TextReadingTask, TextReadingExecution, TextReadingResult,
        QuestionsTask, QuestionsExecution, QuestionsResult,
        PicturesComparisionTask, PicturesComparisionExecution, PicturesComparisionResult,
        Monologue9GradeTask, Monologue9GradeExecution, Monologue9GradeResult,
    },
    provide() {
        return {
            addScreen: this.addScreen,
        }
    },
    data: () => ({
        windowHeight: 0,
        screens: [],
        tab: "tasks"
    }),
    computed: {
        user_info() {
            return this.store.get(["get_user_info", {}])
        }
    },
    methods: {
        windowResize() {
            this.windowHeight = this.$refs.window.offsetHeight
        },
        logout() {
            this.store.request(['gateway', "logout", {}])
                .then(res => {
                    if (res) {
                        this.store.authorized = false
                    }
                })
        },
        goBack() {
            this.screens.pop();
        },
        addScreen(screen) {
            this.screens.push(screen);
        }
    }
}
</script>